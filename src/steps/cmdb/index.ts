import {
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import { CMDBItem, IntegrationConfig } from '../../types';
import { ServiceNowClient } from '../../client';
import {
  Entities,
  IngestionSources,
  Relationships,
  Steps,
} from '../../constants';
import { createCMDBEntity } from './converters';
import {
  getAllParents,
  getParsedCMDBClassList,
  getValidClasses,
} from '../../util/cmdbHierarchyUtils';

export async function fetchCMDB(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { logger, instance, jobState } = context;
  const client = new ServiceNowClient(instance.config, logger);

  let cmdbClasses: string[] = [];
  if (instance.config.cmdb_parent) {
    cmdbClasses = getParsedCMDBClassList(instance.config.cmdb_parent!);
    cmdbClasses = await getValidClasses(
      client,
      cmdbClasses,
      logger,
      instance.config.cmdb_parent!,
    );
  }

  for (const className of cmdbClasses) {
    const parent = className.trim();
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
