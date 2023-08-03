import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';

import { getStepTestConfigForStep } from '../../test/util/createTestConfig';
import { setupServiceNowRecording } from '../../test/util/recording';
import { Steps } from '../constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - account', async () => {
  const stepTestConfig = getStepTestConfigForStep(Steps.ACCOUNT);

  recording = setupServiceNowRecording({
    name: Steps.ACCOUNT,
    directory: __dirname,
  });

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 100_000);

test('step - users', async () => {
  const stepTestConfig = getStepTestConfigForStep(Steps.USERS);

  recording = setupServiceNowRecording({
    name: Steps.USERS,
    directory: __dirname,
  });

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 10_000);

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
  const stepTestConfig = getStepTestConfigForStep(Steps.GROUP_MEMBERS);

  recording = setupServiceNowRecording({
    name: Steps.GROUP_MEMBERS,
    directory: __dirname,
  });

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 100_000);

test('step - incidents', async () => {
  const stepTestConfig = getStepTestConfigForStep(Steps.INCIDENTS);

  recording = setupServiceNowRecording({
    name: Steps.INCIDENTS,
    directory: __dirname,
  });

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 100_000);
