import { RelationshipClass } from '@jupiterone/integration-sdk-core';

export const IngestionSources = {
  GROUPS: 'groups',
  INCIDENTS: 'incidents',
  CMDB_ITEMS: 'cmdb_items',
};

export const Steps = {
  ACCOUNT: 'step-account',
  USERS: 'step-users',
  GROUPS: 'step-groups',
  GROUP_MEMBERS: 'step-group-members',
  INCIDENTS: 'step-incidents',
  CMDB: 'step-cmdb',
};

export const Entities = {
  ACCOUNT: {
    resourceName: 'Account',
    _type: 'service_now_account',
    _class: 'Account',
    disableClassMatch: true,
  },
  USER: {
    resourceName: 'User',
    _type: 'service_now_user',
    _class: 'User',
    disableClassMatch: true,
  },
  GROUP: {
    resourceName: 'User Group',
    _type: 'service_now_group',
    _class: 'UserGroup',
    disableClassMatch: true,
  },
  INCIDENT: {
    resourceName: 'Incident',
    _type: 'service_now_incident',
    _class: 'Incident',
    disableClassMatch: true,
    indexMetadata: {
      enabled: false,
    },
  },
  CMDB_OBJECT: {
    resourceName: 'CMDB Object',
    _type: 'service_now_cmdb_object',
    _class: 'Configuration',
    disableClassMatch: true,
    indexMetadata: {
      enabled: false,
    },
  },
};

export const Relationships = {
  ACCOUNT_HAS_USER: {
    _type: 'service_now_account_has_user',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.USER._type,
  },
  ACCOUNT_HAS_GROUP: {
    _type: 'service_now_account_has_group',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.GROUP._type,
  },
  GROUP_HAS_USER: {
    _type: 'service_now_group_has_user',
    sourceType: Entities.GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.USER._type,
  },
  GROUP_HAS_GROUP: {
    _type: 'service_now_group_has_group',
    sourceType: Entities.GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.GROUP._type,
  },
  INCIDENT_ASSIGNED_USER: {
    _type: 'service_now_incident_assigned_user',
    sourceType: Entities.INCIDENT._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: Entities.USER._type,
  },
  CMDB_ASSIGNED_TO_USER: {
    _type: 'service_now_cmdb_object_assigned_user',
    sourceType: Entities.CMDB_OBJECT._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: Entities.USER._type,
  },
  USER_OWNS_CMDB: {
    _type: 'service_now_user_owns_cmdb_object',
    sourceType: Entities.USER._type,
    _class: RelationshipClass.OWNS,
    targetType: Entities.CMDB_OBJECT._type,
  },
  USER_MANAGES_CMDB: {
    _type: 'service_now_user_manages_cmdb_object',
    sourceType: Entities.USER._type,
    _class: RelationshipClass.MANAGES,
    targetType: Entities.CMDB_OBJECT._type,
  },
  GROUP_MANAGES_CMDB: {
    _type: 'service_now_group_manages_cmdb_object',
    sourceType: Entities.GROUP._type,
    _class: RelationshipClass.MANAGES,
    targetType: Entities.CMDB_OBJECT._type,
  },
};
