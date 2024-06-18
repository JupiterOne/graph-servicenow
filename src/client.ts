import axios, { AxiosError } from 'axios';
import { retry } from '@lifeomic/attempt';

import {
  IntegrationConfig,
  PaginatedResponse,
  ServiceNowUser,
  ServiceNowGroup,
  ServiceNowGroupMember,
  ServiceNowIncident,
  ServiceNowDatabaseTable,
} from './types';
import { getServiceNowNextLink } from './util/getServiceNowNextLink';
import {
  IntegrationProviderAuthorizationError,
  IntegrationValidationError,
  IntegrationLogger,
} from '@jupiterone/integration-sdk-core';

type Iteratee<T = any> = (r: T) => void | Promise<void>;

export enum ServiceNowTable {
  USER = 'sys_user',
  USER_GROUP = 'sys_user_group',
  DATABASE_TABLES = 'sys_db_object',
  GROUP_MEMBER = 'sys_user_grmember',
  INCIDENT = 'incident',
  SYS_DICTIONARY = 'sys_db_object',
}

const DEFAULT_RESPONSE_LIMIT = 500;

/**
 * The ServiceNowClient maintains authentication state and provides an interface to
 * interact with the ServiceNow Table API.
 */
export class ServiceNowClient {
  private hostname: string;
  private username: string;
  private password: string;

  private logger: IntegrationLogger;

  private limit: number;

  constructor(readonly config: IntegrationConfig, logger: IntegrationLogger) {
    this.hostname = config.hostname;
    this.username = config.username;
    this.password = config.password;

    this.logger = logger;

    this.limit = DEFAULT_RESPONSE_LIMIT;
  }
  async validateCMDBParent(parent: string) {
    return this.fetchTableResource({
      table: parent,
      limit: 1,
    });
  }
  async validate() {
    const url = this.createRequestUrl({
      table: ServiceNowTable.USER,
      limit: 1,
    });

    try {
      await this.request({ url });
    } catch (err) {
      if (err.code === 'ENOTFOUND') {
        throw new IntegrationValidationError(
          `Failure validating the ServiceNow API: ${err.message}`,
        );
      }

      if (err.isAxiosError) {
        if ((err as AxiosError).response?.status === 401) {
          throw new IntegrationProviderAuthorizationError({
            cause: err,
            endpoint: url,
            status: (err as AxiosError).response?.status as number,
            statusText: JSON.stringify((err as AxiosError).response?.data),
          });
        }
      }

      throw err;
    }
  }

  private createRequestUrl(options: {
    table: string;
    limit?: number;
    query?: { [key: string]: string };
  }) {
    const limit = options.limit || this.limit;
    let query = '';
    if (options.query)
      [
        Object.entries(options.query).forEach(
          ([key, value]) => (query += `&${key}=${value}`),
        ),
      ];
    return `https://${this.hostname}/api/now/table/${options.table}?sysparm_limit=${limit}${query}`;
  }

  private async request(options: { url: string }) {
    return await axios({
      method: 'GET',
      url: options.url,
      auth: {
        username: this.username,
        password: this.password,
      },
      responseType: 'json',
    });
  }

  async retryResourceRequest<T>(url: string): Promise<T> {
    return retry(
      async () => {
        const response = await this.request({ url });
        const result = response?.data?.result;

        if (Array.isArray(result)) {
          const nextLink = getServiceNowNextLink(response?.headers?.link);
          return { result, nextLink };
        }
        return result;
      },
      {
        maxAttempts: 3,
        handleError: async (error) => {
          this.logger.error(
            { code: error.code, error, url },
            'Error retrying request',
          );
          if (
            error instanceof AxiosError &&
            (error as AxiosError).response?.status === 429
          ) {
            const retryAfter = (error as AxiosError).response?.headers[
              'retry-after'
            ];
            if (retryAfter) {
              const timeToWaitInMillis = Number(retryAfter) * 1000;
              const timeNow = new Date().getTime();
              this.logger.info(
                {
                  TimeToWaitInMilis: retryAfter,
                  timeNow: timeNow,
                  waitingTill: timeNow + retryAfter,
                },
                'Hit Max API rate. Waiting for retry.',
              );
              await this.sleep(Number(timeToWaitInMillis));
            }
          }
          return;
        },
      },
    );
  }

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async fetchTableResource<T>(options: {
    table: string;
    limit?: number;
    query?: { [key: string]: string };
  }): Promise<T> {
    return this.retryResourceRequest(this.createRequestUrl(options));
  }

  async iterateTableResources<T>(options: {
    table: string;
    callback: Iteratee<T>;
    query?: { [key: string]: string };
    limit?: number;
  }) {
    const { table, callback, query, limit } = options;
    let url: string | undefined = this.createRequestUrl({
      table,
      limit,
      query,
    });
    do {
      const paginatedResponse: PaginatedResponse<T> = await this.retryResourceRequest<
        PaginatedResponse<T>
      >(url);

      // For some reason Servicenow API sometimes have string responses for paginated endpoints
      if (
        paginatedResponse?.result &&
        Array.isArray(paginatedResponse.result)
      ) {
        for (const r of paginatedResponse.result) {
          await callback(r);
        }
      }
      url = paginatedResponse?.nextLink;
    } while (url);
  }

  async iterateUsers(callback: Iteratee<ServiceNowUser>) {
    return this.iterateTableResources<ServiceNowUser>({
      table: ServiceNowTable.USER,
      callback,
    });
  }

  async iterateGroups(callback: Iteratee<ServiceNowGroup>) {
    return this.iterateTableResources<ServiceNowGroup>({
      table: ServiceNowTable.USER_GROUP,
      callback,
    });
  }

  async iterateGroupMembers(callback: Iteratee<ServiceNowGroupMember>) {
    return this.iterateTableResources<ServiceNowGroupMember>({
      table: ServiceNowTable.GROUP_MEMBER,
      callback,
    });
  }

  async iterateIncidents(callback: Iteratee<ServiceNowIncident>) {
    return this.iterateTableResources<ServiceNowIncident>({
      table: ServiceNowTable.INCIDENT,
      callback,
    });
  }

  async listTableNames(tableNamePrefix: string = ''): Promise<string[]> {
    const tableNames: string[] = [];
    await this.iterateTableResources<ServiceNowDatabaseTable>({
      table: ServiceNowTable.DATABASE_TABLES,
      callback: (t) => {
        if ((t.name as string).startsWith(tableNamePrefix)) {
          tableNames.push(t.name);
        }
      },
    });
    return tableNames;
  }
}
