import {
  IntegrationLogger,
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  CMDBItem,
  IntegrationConfig,
  PaginatedResponse,
  ServiceNowDatabaseTable,
} from '../../types';
import { ServiceNowClient, ServiceNowTable } from '../../client';
import {
  Entities,
  IngestionSources,
  Relationships,
  Steps,
} from '../../constants';
import { createCMDBEntity } from './converters';

let SysClassNamesParents: {
  [key: string]: string;
}; //Used to store a cache of the parents of each class

export async function fetchCMDB(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { logger, instance, jobState } = context;
  const client = new ServiceNowClient(instance.config, logger);
  SysClassNamesParents = {};

  const parent = instance.config.cmdb_parent!;

  await client.iterateTableResources({
    table: parent,
    limit: 3_000,
    callback: async (resource: CMDBItem) => {
      const sysClassNames = [
        resource.sys_class_name,
        ...(await getAllParents(client, resource.sys_class_name, logger)),
      ];
      if (!jobState.hasKey(resource.sys_id)) {
        const cmdbEntity = createCMDBEntity(resource, sysClassNames);
        await jobState.addEntity(cmdbEntity);

        if (
          cmdbEntity.managedBy &&
          jobState.hasKey(cmdbEntity.managedBy as string)
        ) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.MANAGES,
              fromKey: cmdbEntity.managedBy as string,
              fromType: Entities.USER._type,
              toKey: cmdbEntity._key,
              toType: cmdbEntity._type,
            }),
          );
        }

        if (
          cmdbEntity.ownedBy &&
          jobState.hasKey(cmdbEntity.ownedBy as string)
        ) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.OWNS,
              fromKey: cmdbEntity.ownedBy as string,
              fromType: Entities.USER._type,
              toKey: cmdbEntity._key,
              toType: cmdbEntity._type,
            }),
          );
        }

        if (
          cmdbEntity.managedByGroup &&
          jobState.hasKey(cmdbEntity.managedByGroup as string)
        ) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.MANAGES,
              fromKey: cmdbEntity.managedByGroup as string,
              fromType: Entities.GROUP._type,
              toKey: cmdbEntity._key,
              toType: cmdbEntity._type,
            }),
          );
        }

        if (
          cmdbEntity.assignedTo &&
          jobState.hasKey(cmdbEntity.assignedTo as string)
        ) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.ASSIGNED,
              toKey: cmdbEntity.assignedTo as string,
              toType: Entities.USER._type,
              fromKey: cmdbEntity._key,
              fromType: cmdbEntity._type,
            }),
          );
        }
      }
    },
  });
}

async function getAllParents(
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
export const cmdbIntegrationSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: Steps.CMDB,
    ingestionSourceId: IngestionSources.CMDB_ITEMS,
    name: 'CMDB Items',
    entities: [Entities.CMDB_OBJECT],
    relationships: [
      Relationships.USER_MANAGES_CMDB,
      Relationships.USER_OWNS_CMDB,
      Relationships.CMDB_ASSIGNED_TO_USER,
      Relationships.GROUP_MANAGES_CMDB,
    ],
    dependsOn: [],
    dependencyGraphId: 'last',
    executionHandler: fetchCMDB,
  },
];
