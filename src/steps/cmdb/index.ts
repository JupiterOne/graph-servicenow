import {
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
  createDirectRelationship,
  getRawData,
} from '@jupiterone/integration-sdk-core';
import { CMDBItem, DictionaryItem, IntegrationConfig } from '../../types';
import { ServiceNowClient, ServiceNowTable } from '../../client';
import { Entities, Relationships, Steps } from '../../constants';
import { createCMDBEntity } from './converters';
let SysClassNamesParents: {
  [key: string]: string;
};
export async function fetchCMDB(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { logger, instance, jobState } = context;
  const client = new ServiceNowClient(instance.config, logger);
  SysClassNamesParents = {};
  await client.iterateTableResources({
    table: instance.config.cmdb_parent,
    limit: 400,
    callback: async (resource: CMDBItem) => {
      const sysClassNames = [
        resource.sys_class_name,
        ...(await getAllParents(client, resource.sys_class_name)),
      ];
      await jobState.addEntity(createCMDBEntity(resource, sysClassNames));
    },
  });
}
export async function buildUserManagesCMDB(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { jobState } = context;
  await jobState.iterateEntities(
    { _type: Entities.CMDB_OBJECT._type },
    async (cmdbEntity) => {
      const cmdb = getRawData<CMDBItem>(cmdbEntity);
      const userId = cmdb?.managed_by;
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
      const cmdb = getRawData<CMDBItem>(cmdbEntity);
      const userId = cmdb?.owned_by;
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
      const cmdb = getRawData<CMDBItem>(cmdbEntity);
      const groupId = cmdb?.managed_by_group;
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
      const cmdb = getRawData<CMDBItem>(cmdbEntity);
      const userId = cmdb?.assigned_to.value;
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
): Promise<string[]> {
  if (sysClassName == 'cmdb_ci') {
    return [];
  }
  if (!SysClassNamesParents[sysClassName]) {
    await client.iterateTableResources({
      table: ServiceNowTable.sys_dictionary,
      query: { name: sysClassName, sysparm_fields: 'super_class,name' },
      callback: async (r: DictionaryItem) => {
        const newParent = await client.retryResourceRequest(
          `${r.super_class.link}?sysparm_fields=super_class,name`,
        );
        SysClassNamesParents[r.name] = (newParent as any).name;
      },
    });
  }
  return [
    SysClassNamesParents[sysClassName],
    ...(await getAllParents(client, SysClassNamesParents[sysClassName])),
  ];
}
export const cmdbIntegrationSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: Steps.CMDB,
    name: 'Fetch CMDB Configuration Items',
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
