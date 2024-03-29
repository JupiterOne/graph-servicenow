import {
  Entity,
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../../constants';
import { CMDBItem } from '../../types';
import { skippedRawDataSource } from '../../util/graphObject';

export function createCMDBEntity(
  data: CMDBItem,
  sysClassNames: string[],
): Entity {
  //For now all sysclassnames use the same converter. We can always create different converters.
  const customFields: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(data)) {
    //custom fields
    if (key.startsWith('u_') || key.includes('_u_')) {
      customFields[key.split('_').join('-')] = JSON.stringify(value);
    }
  }

  return createIntegrationEntity({
    entityData: {
      source: skippedRawDataSource, // Raw data is really big.
      assign: {
        _class: Entities.CMDB_OBJECT._class,
        _type: Entities.CMDB_OBJECT._type,
        _key: data.sys_id,
        id: data.sys_id,
        correlationId: data.correlation_id,
        name: data.name,
        displayName: data.name,
        sysClassNames: sysClassNames,
        installStatus: data.install_status,
        attributes: data.attributes,
        businessUnit: data.business_unit,
        category: data.category,
        enviroment: data.environment,
        ipAddress: data.ip_address,
        macAddress: data.mac_address,
        operationalStatus: data.operational_status,
        serial: data.serial_number,
        subcategory: data.subcategory,
        warrantyExpiration: parseTimePropertyValue(data.warranty_expiration),
        model: data.model_number,
        managedBy: data.managed_by?.value,
        ownedBy: data.owned_by?.value,
        managedByGroup: data.managed_by_group?.value,
        assignedTo: data.assigned_to?.value,
        createdOn: parseTimePropertyValue(data.sys_created_on),
        updatedOn: parseTimePropertyValue(data.sys_updated_on),
        ...customFields,
      },
    },
  });
}
