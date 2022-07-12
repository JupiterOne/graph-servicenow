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

  const user = {
    calendar_integration: '1',
    country: '',
    user_password: user_password,
    last_login_time: '2020-09-23 22:00:16',
    source: '',
    sys_updated_on: '2020-09-23 22:07:54',
    building: '',
    web_service_access_only: 'false',
    notification: '2',
    enable_multifactor_authn: 'false',
    sys_updated_by: 'j1-administrator',
    sys_created_on: '2020-09-21 17:57:17',
    sys_domain: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user_group/global',
      value: 'global',
    },
    state: '',
    vip: 'false',
    sys_created_by: 'admin',
    zip: '',
    home_phone: '',
    time_format: '',
    last_login: '2020-09-23',
    default_perspective: '',
    active: 'true',
    sys_domain_path: '/',
    cost_center: '',
    phone: '',
    name: 'Jupiterone Administrator',
    employee_number: '',
    password_needs_reset: 'false',
    gender: '',
    city: '',
    failed_attempts: '0',
    user_name: 'j1-administrator',
    roles: '',
    title: '',
    sys_class_name: 'sys_user',
    sys_id: '5ccbba87db1310109d87a9954b9619db',
    internal_integration_user: 'false',
    ldap_server: '',
    mobile_phone: '',
    street: '',
    company: '',
    department: {
      link:
        'https://dev94579.service-now.com/api/now/table/cmn_department/9d7802bfdb1710109d87a9954b96199d',
      value: '9d7802bfdb1710109d87a9954b96199d',
    },
    first_name: 'Jupiterone',
    email: 'j1-admin@jupiterone.com',
    introduction: '',
    preferred_language: '',
    manager: '',
    locked_out: 'false',
    sys_mod_count: '5',
    last_name: 'Administrator',
    photo: '',
    avatar: '',
    middle_name: '',
    sys_tags: '',
    time_zone: '',
    schedule: '',
    date_format: '',
    location: '',
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
  const group = {
    parent: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user_group/43f6027fdb1710109d87a9954b961939',
      value: '43f6027fdb1710109d87a9954b961939',
    },
    manager: '',
    roles: '',
    sys_mod_count: '0',
    active: 'true',
    description: '',
    source: '',
    sys_updated_on: '2020-09-23 22:03:48',
    sys_tags: '',
    type: '',
    sys_id: '66a74a7fdb1710109d87a9954b961914',
    sys_updated_by: 'j1-administrator',
    cost_center: '',
    default_assignee: '',
    sys_created_on: '2020-09-23 22:03:48',
    name: 'j1-subgroup',
    exclude_manager: 'false',
    email: 'j1-subgroup@jupiterone.com',
    include_members: 'false',
    sys_created_by: 'j1-administrator',
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

describe('incident', () => {
  const incident = {
    parent: '',
    made_sla: 'true',
    caused_by: '',
    watch_list: '',
    upon_reject: 'cancel',
    sys_updated_on: '2016-12-14 02:46:44',
    child_incidents: '0',
    hold_reason: '',
    task_effective_number: 'INC0000060',
    approval_history: '',
    number: 'INC0000060',
    resolved_by: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user/5137153cc611227c000bbd1bd8cd2007',
      value: '5137153cc611227c000bbd1bd8cd2007',
    },
    sys_updated_by: 'employee',
    opened_by: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user/681ccaf9c0a8016400b98a06818d57c7',
      value: '681ccaf9c0a8016400b98a06818d57c7',
    },
    user_input: '',
    sys_created_on: '2016-12-12 15:19:57',
    sys_domain: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user_group/global',
      value: 'global',
    },
    state: '7',
    route_reason: '',
    sys_created_by: 'employee',
    knowledge: 'false',
    order: '',
    calendar_stc: '102197',
    closed_at: '2016-12-14 02:46:44',
    cmdb_ci: {
      link:
        'https://dev94579.service-now.com/api/now/table/cmdb_ci/109562a3c611227500a7b7ff98cc0dc7',
      value: '109562a3c611227500a7b7ff98cc0dc7',
    },
    delivery_plan: '',
    contract: '',
    impact: '2',
    active: 'false',
    work_notes_list: '',
    business_service: {
      link:
        'https://dev94579.service-now.com/api/now/table/cmdb_ci_service/27d32778c0a8000b00db970eeaa60f16',
      value: '27d32778c0a8000b00db970eeaa60f16',
    },
    priority: '3',
    sys_domain_path: '/',
    rfc: '',
    time_worked: '',
    expected_start: '',
    opened_at: '2016-12-12 15:19:57',
    business_duration: '1970-01-01 08:00:00',
    group_list: '',
    work_end: '',
    caller_id: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user/681ccaf9c0a8016400b98a06818d57c7',
      value: '681ccaf9c0a8016400b98a06818d57c7',
    },
    reopened_time: '',
    resolved_at: '2016-12-13 21:43:14',
    approval_set: '',
    subcategory: 'email',
    work_notes: '',
    universal_request: '',
    short_description: 'Unable to connect to email',
    close_code: 'Solved (Permanently)',
    correlation_display: '',
    delivery_task: '',
    work_start: '',
    assignment_group: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user_group/287ebd7da9fe198100f92cc8d1d2154e',
      value: '287ebd7da9fe198100f92cc8d1d2154e',
    },
    additional_assignee_list: '',
    business_stc: '28800',
    description:
      'I am unable to connect to the email server. It appears to be down.',
    calendar_duration: '1970-01-02 04:23:17',
    close_notes: 'This incident is resolved.',
    notify: '1',
    service_offering: '',
    sys_class_name: 'incident',
    closed_by: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user/681ccaf9c0a8016400b98a06818d57c7',
      value: '681ccaf9c0a8016400b98a06818d57c7',
    },
    follow_up: '',
    parent_incident: '',
    sys_id: '1c741bd70b2322007518478d83673af3',
    contact_type: 'self-service',
    reopened_by: '',
    incident_state: '7',
    urgency: '2',
    problem_id: '',
    company: {
      link:
        'https://dev94579.service-now.com/api/now/table/core_company/31bea3d53790200044e0bfc8bcbe5dec',
      value: '31bea3d53790200044e0bfc8bcbe5dec',
    },
    reassignment_count: '2',
    activity_due: '2016-12-13 01:26:36',
    assigned_to: {
      link:
        'https://dev94579.service-now.com/api/now/table/sys_user/5137153cc611227c000bbd1bd8cd2007',
      value: '5137153cc611227c000bbd1bd8cd2007',
    },
    severity: '3',
    comments: '',
    approval: 'not requested',
    sla_due: '',
    comments_and_work_notes: '',
    due_date: '',
    sys_mod_count: '15',
    reopen_count: '0',
    sys_tags: '',
    escalation: '0',
    upon_approval: 'proceed',
    correlation_id: '',
    location: '',
    category: 'inquiry',
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
