import {
  IntegrationLogger,
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import { CMDBItem, IntegrationConfig } from '../../types';
import { ServiceNowClient, ServiceNowTable } from '../../client';
import { Entities, Relationships, Steps } from '../../constants';
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
  const otherClassesIds: { [key: string]: string[] } = {};

  const parent = instance.config.cmdb_parent!;

  await client.iterateTableResources({
    table: parent,
    callback: async (resource: CMDBItem) => {
      //If the class equals the cmdb_parent then ingest it as is.
      if (resource.sys_class_name == parent) {
        const sysClassNames = [
          resource.sys_class_name,
          ...(await getAllParents(client, resource.sys_class_name, logger)),
        ];
        if (!jobState.hasKey(resource.sys_id)) {
          await jobState.addEntity(createCMDBEntity(resource, sysClassNames));
        }
      } else {
        //If the class does not equal the cmdb_parent then save the class and id.
        //This is probably a memory problem with larges amount of data. For now it makes it
        //really efficient in ammount of calls. But not good in memory. Might need to be optimized.
        if (!otherClassesIds[resource.sys_class_name]) {
          otherClassesIds[resource.sys_class_name] = [];
        }
        otherClassesIds[resource.sys_class_name].push(resource.sys_id);
      }
    },
  });
  //for all saved classes and ids, fetch the class and ingest.
  for (const key in otherClassesIds) {
    const sysClassNames = [key, ...(await getAllParents(client, key, logger))];
    await client.iterateTableResources({
      table: key,
      callback: async (resource: CMDBItem) => {
        if (!otherClassesIds[key].includes(resource.sys_id)) return;
        if (!jobState.hasKey(resource.sys_id)) {
          await jobState.addEntity(createCMDBEntity(resource, sysClassNames));
        }
      },
    });
  }
}
export async function buildUserManagesCMDB(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { jobState } = context;
  await jobState.iterateEntities(
    { _type: Entities.CMDB_OBJECT._type },
    async (cmdbEntity) => {
      const userId = (cmdbEntity as any).managedBy;
      if (!userId) {
        return;
      }
      const userEntity = await jobState.findEntity(userId);
      if (userEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.MANAGES,
            from: userEntity,
            to: cmdbEntity,
          }),
        );
      }
    },
  );
}
export async function buildUserOwnsCMDB(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { jobState } = context;
  await jobState.iterateEntities(
    { _type: Entities.CMDB_OBJECT._type },
    async (cmdbEntity) => {
      const userId = (cmdbEntity as any).ownedBy;
      if (!userId) {
        return;
      }
      const userEntity = await jobState.findEntity(userId);
      if (userEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.OWNS,
            from: userEntity,
            to: cmdbEntity,
          }),
        );
      }
    },
  );
}
export async function buildGroupManagesCMDB(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { jobState } = context;
  await jobState.iterateEntities(
    { _type: Entities.CMDB_OBJECT._type },
    async (cmdbEntity) => {
      const groupId = (cmdbEntity as any).managedByGroup;
      if (!groupId) {
        return;
      }
      const groupEntity = await jobState.findEntity(groupId);
      if (groupEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.MANAGES,
            from: groupEntity,
            to: cmdbEntity,
          }),
        );
      }
    },
  );
}
export async function buildCMDBAssignedUser(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { jobState } = context;
  await jobState.iterateEntities(
    { _type: Entities.CMDB_OBJECT._type },
    async (cmdbEntity) => {
      const userId = (cmdbEntity as any).assignedTo;
      if (!userId) {
        return;
      }
      const userEntity = await jobState.findEntity(userId);
      if (userEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.ASSIGNED,
            from: cmdbEntity,
            to: userEntity,
          }),
        );
      }
    },
  );
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
    const dictionaryClass = (await client.fetchTableResource({
      table: ServiceNowTable.SYS_DICTIONARY,
      query: { name: sysClassName, sysparm_fields: 'super_class,name' },
    })) as any;
    try {
      const newParent = await client.retryResourceRequest(
        `${dictionaryClass[0].super_class.link}?sysparm_fields=super_class,name`,
      );
      SysClassNamesParents[dictionaryClass[0].name] = (newParent as any).name;
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
    name: 'CMDB Items',
    entities: [Entities.CMDB_OBJECT],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchCMDB,
  },
  {
    id: Steps.USER_MANAGES_CMDB,
    name: 'Build user manages CMDB',
    entities: [],
    relationships: [Relationships.USER_MANAGES_CMDB],
    dependsOn: [Steps.CMDB, Steps.USERS],
    executionHandler: buildUserManagesCMDB,
  },
  {
    id: Steps.USER_OWNS_CMDB,
    name: 'Build user owns CMDB',
    entities: [],
    relationships: [Relationships.USER_OWNS_CMDB],
    dependsOn: [Steps.CMDB, Steps.USERS],
    executionHandler: buildUserOwnsCMDB,
  },
  {
    id: Steps.CMDB_ASSIGNED_USER,
    name: 'CMDB assigned to user',
    entities: [],
    relationships: [Relationships.CMDB_ASSIGNED_TO_USER],
    dependsOn: [Steps.CMDB, Steps.USERS],
    executionHandler: buildCMDBAssignedUser,
  },
  {
    id: Steps.GROUP_MANAGES_CMDB,
    name: 'Group manages CMDB',
    entities: [],
    relationships: [Relationships.GROUP_MANAGES_CMDB],
    dependsOn: [Steps.CMDB, Steps.GROUPS],
    executionHandler: buildGroupManagesCMDB,
  },
];
