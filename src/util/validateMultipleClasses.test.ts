import {
  Recording,
  createMockIntegrationLogger,
} from '@jupiterone/integration-sdk-testing';
import { configFromEnv } from '../../test/util/createTestConfig';
import { setupServiceNowRecording } from '../../test/util/recording';
import { ServiceNowClient } from '../client';
import { validateMultipleClasses } from './cmdbHierarchyUtils';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('Validate multiple classes, with invalid and redudant names', async () => {
  recording = setupServiceNowRecording({
    name: 'validate-multiple-classes',
    directory: __dirname,
  });
  const logger = createMockIntegrationLogger();
  const client = new ServiceNowClient(configFromEnv, logger);
  const response = await validateMultipleClasses(
    client,
    [
      'cmdb_ci_server',
      'cmdb_ci_pc_hardware',
      'cmdb_ci_computer',
      'cmbd_ci_somethingwrong',
    ],
    logger,
  );
  expect(response.invalidClasses).toContain('cmbd_ci_somethingwrong');
  expect(response.invalidClasses.length).toBe(1);
  expect(response.redundantClasses).toContain('cmdb_ci_server');
  expect(response.redundantClasses).toContain('cmdb_ci_pc_hardware');
  expect(response.redundantClasses.length).toBe(2);
}, 100_000);

test('Validate multiple classes, with the same class twice', async () => {
  recording = setupServiceNowRecording({
    name: 'validate-multiple-classes-1',
    directory: __dirname,
  });
  const logger = createMockIntegrationLogger();
  const client = new ServiceNowClient(configFromEnv, logger);
  const response = await validateMultipleClasses(
    client,
    ['cmdb_ci_computer', 'cmdb_ci_computer'],
    logger,
  );
  expect(response.invalidClasses.length).toBe(0);
  expect(response.redundantClasses).toContain('cmdb_ci_computer');
  expect(response.redundantClasses.length).toBe(1);
}, 100_000);

test('Validate multiple classes, with parent and child classes', async () => {
  recording = setupServiceNowRecording({
    name: 'validate-multiple-classes-2',
    directory: __dirname,
  });
  const logger = createMockIntegrationLogger();
  const client = new ServiceNowClient(configFromEnv, logger);
  const response = await validateMultipleClasses(
    client,
    ['cmdb_ci_computer', 'cmdb_ci'],
    logger,
  );
  expect(response.invalidClasses.length).toBe(0);
  expect(response.redundantClasses).toContain('cmdb_ci_computer');
  expect(response.redundantClasses.length).toBe(1);
}, 100_000);
