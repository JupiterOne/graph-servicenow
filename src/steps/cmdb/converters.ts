import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../../constants';
import { CMDBItem } from '../../types';

export function createCMDBEntity(
  data: CMDBItem,
  sysClassNames: string[],
): Entity {
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
        managedBy: data.managed_by,
        managedByGroup: data.managed_by_group,
        ownedBy: data.owned_by,
        category: data.category,
        enviroment: data.environment,
        ipAddress: data.ip_address,
        macAddress: data.mac_address,
        operationalStatus: data.operational_status,
        serial: data.serial_number,
        subcategory: data.subcategory,
        warrantyExpiration: data.warranty_expiration,
        model: data.model_number,
      },
    },
  });
}
