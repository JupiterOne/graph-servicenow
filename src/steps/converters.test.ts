import {
  createUserEntity,
  createGroupEntity,
  createGroupUserRelationship,
  createGroupGroupRelationship,
  createAccountEntity,
  createIncidentEntity,
  createIncidentAssigneeRelationship,
} from './converters';
import { Entities } from '../constants';
import {
  ServiceNowActiveEnum,
  ServiceNowIncident,
  ServiceNowUser,
  ServiceNowGroup,
} from '../types';

test('createAccountEntity', () => {
  const hostname = 'dev00000.service-now.com';

  const accountEntity = createAccountEntity(hostname);

  expect(accountEntity).toMatchGraphObjectSchema({
    _class: [Entities.ACCOUNT._class],
    schema: {},
  });
  expect(accountEntity).toMatchSnapshot();
});

test('createUserEntity', () => {
  const user_password = 'some-bogus-password';

  const user: ServiceNowUser = {
    sys_id: '5ccbba87db1310109d87a9954b9619db',
    name: 'J1 Administrator',
    user_name: 'j1-administrator',
    active: ServiceNowActiveEnum.TRUE,
    email: 'j1-admin@jupiterone.com',
    user_password: user_password,
    sys_created_on: '2020-09-21 17:57:17',
    sys_updated_on: '2020-09-23 22:07:54',
  };

  const userEntity = createUserEntity(user);

  expect(userEntity).toMatchGraphObjectSchema({
    _class: [Entities.USER._class],
    schema: {},
  });
  expect(userEntity).toMatchSnapshot();
  expect(JSON.stringify(userEntity).includes(user_password)).toBe(false);
  expect(JSON.stringify(userEntity).includes('user_password')).toBe(false);
});

test('createGroupEntity', () => {
  const group: ServiceNowGroup = {
    name: 'test name',
    parent: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user_group/43f6027fdb1710109d87a9954b961939',
      value: '43f6027fdb1710109d87a9954b961939',
    },
    active: ServiceNowActiveEnum.TRUE,
    sys_updated_on: '2020-09-23 22:03:48',
    sys_id: '66a74a7fdb1710109d87a9954b961914',
    sys_created_on: '2020-09-23 22:03:48',
    email: 'j1-subgroup@jupiterone.com',
  };

  const groupEntity = createGroupEntity(group);

  expect(groupEntity).toMatchGraphObjectSchema({
    _class: [Entities.GROUP._class],
    schema: {},
  });
  expect(groupEntity).toMatchSnapshot();

  const groupGroupRelationship = createGroupGroupRelationship(
    groupEntity,
    group.parent,
  );
  expect(groupGroupRelationship).toMatchSnapshot();
});

test('createGroupUserRelationship', () => {
  const groupUser = {
    sys_id: '94878e3fdb1710109d87a9954b96195f',
    sys_updated_by: 'j1-administrator',
    sys_created_on: '2020-09-23 22:02:55',
    sys_mod_count: '0',
    sys_updated_on: '2020-09-23 22:02:55',
    sys_tags: '',
    user: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user/5ccbba87db1310109d87a9954b9619db',
      value: '5ccbba87db1310109d87a9954b9619db',
    },
    sys_created_by: 'j1-administrator',
    group: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user_group/43f6027fdb1710109d87a9954b961939',
      value: '43f6027fdb1710109d87a9954b961939',
    },
  };

  const userGroupRelationship = createGroupUserRelationship(groupUser);

  expect(userGroupRelationship).toMatchSnapshot();
});

describe('createIncidentEntity', () => {
  const incident: ServiceNowIncident = {
    number: 'INC0000060',
    severity: '3',
    category: 'inquiry',
    opened_by: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user/681ccaf9c0a8016400b98a06818d57c7',
      value: '681ccaf9c0a8016400b98a06818d57c7',
    },
    impact: 2,
    resolved_at: '2016-12-13 21:43:14',
    active: ServiceNowActiveEnum.FALSE,
    assigned_to: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user/5137153cc611227c000bbd1bd8cd2007',
      value: '5137153cc611227c000bbd1bd8cd2007',
    },
    sys_id: '1c741bd70b2322007518478d83673af3',
    sys_created_on: '2016-12-12 15:19:57',
    sys_updated_on: '2016-12-14 02:46:44',
  };

  test('createIncidentEntity', () => {
    const incidentEntity = createIncidentEntity(incident);
    expect(incidentEntity).toMatchGraphObjectSchema({
      _class: [Entities.INCIDENT._class],
    });
    expect(incidentEntity).toMatchSnapshot();
  });

  test('createIncidentAssigneeRelationship', () => {
    const incidentAssigneeRelationship = createIncidentAssigneeRelationship(
      incident,
    );
    expect(incidentAssigneeRelationship).toMatchDirectRelationshipSchema({});
    expect(incidentAssigneeRelationship).toMatchSnapshot();
  });
});
