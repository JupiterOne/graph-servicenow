import { IntegrationLogger } from '@jupiterone/integration-sdk-core';
import { ServiceNowClient, ServiceNowTable } from '../client';
import { PaginatedResponse, ServiceNowDatabaseTable } from '../types';

export async function validateMultipleClasses(
  client: ServiceNowClient,
  classNames: string[],
  logger: IntegrationLogger,
) {
  const parentsPerClass: {
    [key: string]: string[];
  } = {};
  const invalidClasses: Set<string> = new Set<string>();
  const redundantClasses: Set<string> = new Set<string>();
  // Store all parents per class.
  for (const sysClassName of classNames) {
    if (parentsPerClass[sysClassName]) {
      redundantClasses.add(sysClassName);
      continue;
    }
    parentsPerClass[sysClassName] = [];
    let classToSearch: string | undefined = sysClassName;
    while (classToSearch! && classToSearch != 'cmdb_ci') {
      classToSearch = await getParentClass(client, classToSearch, logger);
      if (!classToSearch) {
        invalidClasses.add(sysClassName);
      }
      parentsPerClass[sysClassName].push(classToSearch!);
    }
  }

  for (const sysClasses of Object.entries(parentsPerClass)) {
    for (const sysClass of sysClasses[1]) {
      if (parentsPerClass[sysClass]) {
        redundantClasses.add(sysClasses[0]);
      }
    }
  }

  return {
    invalidClasses: Array.from(invalidClasses.values()),
    redundantClasses: Array.from(redundantClasses.values()),
  };
}
async function getParentClass(
  client: ServiceNowClient,
  sysClassName: string,
  logger: IntegrationLogger,
) {
  const dictionariesPaginatedResponse: PaginatedResponse<ServiceNowDatabaseTable> = await client.fetchTableResource<
    PaginatedResponse<ServiceNowDatabaseTable>
  >({
    table: ServiceNowTable.SYS_DICTIONARY,
    query: { name: sysClassName, sysparm_fields: 'super_class,name' },
  });
  try {
    if (
      dictionariesPaginatedResponse?.result &&
      dictionariesPaginatedResponse.result.length > 0
    ) {
      const dictionaryClass = dictionariesPaginatedResponse.result[0];
      const newParent = await client.retryResourceRequest<
        ServiceNowDatabaseTable
      >(`${dictionaryClass.super_class.link}?sysparm_fields=super_class,name`);
      return newParent.name;
    }
  } catch (error) {
    logger.error({ error }, 'Could not find super class');
    throw error;
  }
}
const SysClassNamesParents: {
  [key: string]: string;
} = {}; //Used to store a cache of the parents of each class

export async function getAllParents(
  client: ServiceNowClient,
  sysClassName: string,
  logger: IntegrationLogger,
): Promise<string[]> {
  //This functions fetches the parents until the root of the tree. If it is stored in the cache
  //we avoid calling the endpoint.
  if (sysClassName == 'cmdb_ci') {
    return [];
  }
  if (!SysClassNamesParents[sysClassName]) {
    const dictionariesPaginatedResponse: PaginatedResponse<ServiceNowDatabaseTable> = await client.fetchTableResource<
      PaginatedResponse<ServiceNowDatabaseTable>
    >({
      table: ServiceNowTable.SYS_DICTIONARY,
      query: { name: sysClassName, sysparm_fields: 'super_class,name' },
    });
    try {
      if (
        dictionariesPaginatedResponse?.result &&
        dictionariesPaginatedResponse.result.length > 0
      ) {
        const dictionaryClass = dictionariesPaginatedResponse.result[0];
        const newParent = await client.retryResourceRequest<
          ServiceNowDatabaseTable
        >(
          `${dictionaryClass.super_class.link}?sysparm_fields=super_class,name`,
        );
        SysClassNamesParents[dictionaryClass.name] = newParent.name;
      }
    } catch (error) {
      logger.error({ error }, 'Could not find super class');
      return [];
    }
  }
  if (!SysClassNamesParents[sysClassName]) {
    logger.error({ sysClassName }, 'Could not find super class');
    return [];
  }
  return [
    SysClassNamesParents[sysClassName],
    ...(await getAllParents(
      client,
      SysClassNamesParents[sysClassName],
      logger,
    )),
  ];
}
