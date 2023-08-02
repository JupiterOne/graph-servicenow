import {
  createMockStepExecutionContext,
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from '../types';
import {
  buildGroupUserRelationships,
  createAccount,
  fetchIncidents,
} from './index';
import {
  createTestConfig,
  getStepTestConfigForStep,
} from '../../test/util/createTestConfig';
import { setupServiceNowRecording } from '../../test/util/recording';
import { Steps, Entities } from '../constants';

const config = createTestConfig('dev128112.service-now.com');

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
  const stepTestConfig = getStepTestConfigForStep(Steps.USERS);

  recording = setupServiceNowRecording({
    name: Steps.USERS,
    directory: __dirname,
  });

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
});

test('step - groups', async () => {
  const stepTestConfig = getStepTestConfigForStep(Steps.GROUPS);

  recording = setupServiceNowRecording({
    name: Steps.GROUPS,
    directory: __dirname,
  });

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 100_000);

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
