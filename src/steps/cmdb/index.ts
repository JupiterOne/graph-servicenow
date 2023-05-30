import {
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { CMDBItem, DictionaryItem, IntegrationConfig } from '../../types';
import { ServiceNowClient, ServiceNowTable } from '../../client';
import { Entities, Steps } from '../../constants';
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
    callback: async (resource: CMDBItem) => {
      const sysClassNames = [
        resource.sys_class_name,
        ...(await getAllParents(client, resource.sys_class_name)),
      ];
      await jobState.addEntity(createCMDBEntity(resource, sysClassNames));
    },
  });
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
    name: 'CMDB Devices',
    entities: [Entities.CMDB_OBJECT],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchCMDB,
  },
];
