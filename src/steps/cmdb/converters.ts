import {
  Entity,
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../../constants';
import { CMDBItem } from '../../types';

export function createCMDBEntity(
  data: CMDBItem,
  sysClassNames: string[],
): Entity {
  const customFields: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('u_') || key.includes('_u_')) {
      customFields[key.split('_').join('-')] = JSON.stringify(value);
    }
  }
  return createIntegrationEntity({
    entityData: {
      source: data,
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
        warrantyExpiration: data.warranty_expiration,
        model: data.model_number,
        createdOn: parseTimePropertyValue(data.sys_created_on),
        updatedOn: parseTimePropertyValue(data.sys_updated_on),
        ...customFields,
      },
    },
  });
}
