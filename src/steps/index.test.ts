import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from '../types';
import {
  fetchGroups,
  fetchUsers,
  buildGroupUserRelationships,
  createAccount,
  fetchIncidents,
} from './index';
import { createTestConfig } from '../../test/util/createTestConfig';
import { setupServiceNowRecording } from '../../test/util/recording';
import { Steps, Entities } from '../constants';
import { createAccountEntity } from './converters';

const config = createTestConfig('dev128112.service-now.com');

const mockGetData = jest.fn().mockImplementation(
  // eslint-disable-next-line @typescript-eslint/require-await
  async (key) => {
    if (key === Entities.ACCOUNT._type) {
      return createAccountEntity('hostname.service-now.com');
    } else {
      throw new Error('Called jobState.getData(key) with an unexpected `key`!');
    }
  },
);

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - account', async () => {
  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig: config,
  });

  await createAccount(context);

  expect(context.jobState.collectedEntities.length).toEqual(1);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: [Entities.ACCOUNT._class],
    schema: {},
  });

  expect(context.jobState.collectedRelationships.length).toBe(0);
});

test('step - users', async () => {
  recording = setupServiceNowRecording({
    directory: __dirname,
    name: Steps.USERS,
  });
  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig: config,
  });
  context.jobState.getData = mockGetData;

  await fetchUsers(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: [Entities.USER._class],
    schema: {},
  });

  expect(context.jobState.collectedRelationships.length).toBeGreaterThan(0);
  expect(
    context.jobState.collectedRelationships,
  ).toMatchDirectRelationshipSchema({});
}, 10000);

test('step - groups', async () => {
  recording = setupServiceNowRecording({
    directory: __dirname,
    name: Steps.GROUPS,
  });
  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig: config,
  });
  context.jobState.getData = mockGetData;

  await fetchGroups(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: [Entities.GROUP._class],
    schema: {},
  });

  expect(context.jobState.collectedRelationships.length).toBeGreaterThan(0);
  expect(
    context.jobState.collectedRelationships,
  ).toMatchDirectRelationshipSchema({});
});

test('step - group members', async () => {
  recording = setupServiceNowRecording({
    directory: __dirname,
    name: Steps.GROUP_MEMBERS,
  });
  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig: config,
  });

  await buildGroupUserRelationships(context);

  expect(context.jobState.collectedEntities.length).toBe(0);

  expect(context.jobState.collectedRelationships.length).toBeGreaterThan(0);
  expect(
    context.jobState.collectedRelationships,
  ).toMatchDirectRelationshipSchema({});
});

test('step - incidents', async () => {
  recording = setupServiceNowRecording({
    directory: __dirname,
    name: Steps.INCIDENTS,
  });
  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig: config,
  });

  await fetchIncidents(context);

  const { collectedEntities, collectedRelationships } = context.jobState;
  expect(collectedEntities.length).toBeGreaterThan(0);
  expect(collectedEntities).toMatchGraphObjectSchema({
    _class: [Entities.INCIDENT._class],
  });

  expect(collectedRelationships.length).toBeGreaterThan(0);
  expect(collectedRelationships).toMatchDirectRelationshipSchema({});
});
