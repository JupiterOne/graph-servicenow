import {
  IntegrationInfoEventName,
  IntegrationLogger,
} from '@jupiterone/integration-sdk-core';
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
  for (let sysClassName of classNames) {
    sysClassName = sysClassName.trim();
    if (parentsPerClass[sysClassName]) {
      redundantClasses.add(sysClassName);
      continue;
    }
    parentsPerClass[sysClassName] = [];
    let classToSearch: string | undefined = sysClassName;
    while (classToSearch) {
      try {
        classToSearch = await getParentClass(client, classToSearch, logger);
        if (classToSearch) {
          parentsPerClass[sysClassName].push(classToSearch);
        }
      } catch (error) {
        invalidClasses.add(sysClassName);
        classToSearch = undefined;
      }
    }
  }
  // Find redundant classes.
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
      if (dictionaryClass.super_class) {
        const newParent = await client.retryResourceRequest<
          ServiceNowDatabaseTable
        >(
          `${dictionaryClass.super_class.link}?sysparm_fields=super_class,name`,
        );
        return newParent.name;
      }
    } else {
      throw new Error('Could not find parent');
    }
  } catch (error) {
    logger.error(
      {
        err: error,
        sysclass: sysClassName,
        sysDbQueryResponseData: JSON.stringify(dictionariesPaginatedResponse),
      },
      'Could not find super class',
    );
    throw error;
  }
}

/**
 * Used to store a cache of the parents of each class
 */
const SysClassNamesParents: {
  [key: string]: string;
} = {};

/**
 *   This functions fetches the parents until the root of the tree. If it is stored in the cache we avoid calling the endpoint.
 */
export async function getAllParents(
  client: ServiceNowClient,
  sysClassName: string,
  logger: IntegrationLogger,
): Promise<string[]> {
  if (SysClassNamesParents[sysClassName] == sysClassName) {
    //No more parents
    return [];
  }
  //We look for the parent of the class
  if (!SysClassNamesParents[sysClassName]) {
    const parent = await getParentClass(client, sysClassName, logger);
    if (parent) {
      SysClassNamesParents[sysClassName] = parent as string;
    } else {
      SysClassNamesParents[sysClassName] = sysClassName;
      return []; //No further parents
    }
  }
  //We return the parent 'SysClassNamesParents[sysClassName]' and the result of looking for its parent.
  return [
    SysClassNamesParents[sysClassName],
    ...(await getAllParents(
      client,
      SysClassNamesParents[sysClassName],
      logger,
    )),
  ];
}
export function getParsedCMDBClassList(cmbdClassList: string) {
  return cmbdClassList!.split(',').filter((className) => className != '');
}

export async function getValidClasses(
  client: ServiceNowClient,
  cmdbClasses: string[],
  logger: IntegrationLogger,
  currentConfig: string | undefined,
) {
  const validationResponse = await validateMultipleClasses(
    client,
    cmdbClasses,
    logger,
  );

  if (
    validationResponse.invalidClasses.length > 0 ||
    validationResponse.redundantClasses.length > 0
  ) {
    logger.publishInfoEvent({
      name: IntegrationInfoEventName.Info,
      description: `The classes: ${validationResponse.redundantClasses.join(
        ', ',
      )} are considered redundant. Please remove child class(es) in the configuration to fix this message.`,
    });

    logger.warn(
      { validationResponse, currentConfig: currentConfig },
      'Found redundant classes',
    );

    cmdbClasses = cmdbClasses.filter(
      (className) =>
        !validationResponse.invalidClasses.includes(className) &&
        !validationResponse.redundantClasses.includes(className),
    );
  }
  return cmdbClasses;
}
