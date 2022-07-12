import { setupServiceNowRecording, Recording } from '../test/util/recording';
import { ServiceNowClient } from './client';
import { createTestConfig } from '../test/util/createTestConfig';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from './types';

const context = createMockExecutionContext<IntegrationConfig>({
  instanceConfig: createTestConfig('dev128112.service-now.com'),
});

jest.setTimeout(10000);

let recording: Recording;
afterEach(async () => {
  await recording.stop();
});

describe('iterateUsers', () => {
  test('all', async () => {
    recording = setupServiceNowRecording({
      directory: __dirname,
      name: 'iterateUsers',
    });

    const client = new ServiceNowClient(
      context.instance.config,
      context.logger,
    );

    const resources: any[] = [];
    await client.iterateUsers((u) => {
      resources.push(u);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        user_name: 'survey.user',
      }),
    );
  });
});

describe('iterateGroups', () => {
  test('all', async () => {
    recording = setupServiceNowRecording({
      directory: __dirname,
      name: 'iterateGroups',
    });

    const client = new ServiceNowClient(
      context.instance.config,
      context.logger,
    );

    const resources: any[] = [];
    await client.iterateGroups((g) => {
      resources.push(g);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'Software',
      }),
    );
  });
});

describe('iterateGroupMembers', () => {
  test('all', async () => {
    recording = setupServiceNowRecording({
      directory: __dirname,
      name: 'iterateGroupMembers',
    });

    const client = new ServiceNowClient(
      context.instance.config,
      context.logger,
    );

    const resources: any[] = [];
    await client.iterateGroupMembers((g) => {
      resources.push(g);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        user: {
          link: expect.any(String),
          value: '1832fbe1d701120035ae23c7ce610369',
        },
        group: {
          link: expect.any(String),
          value: '0a52d3dcd7011200f2d224837e6103f2',
        },
      }),
    );
  });
});

describe('iterateIncidents', () => {
  test('all', async () => {
    recording = setupServiceNowRecording({
      directory: __dirname,
      name: 'iterateIncidents',
    });

    const client = new ServiceNowClient(
      context.instance.config,
      context.logger,
    );

    const resources: any[] = [];
    await client.iterateIncidents((g) => {
      resources.push(g);
    });

    expect(resources).toContainEqual(
      expect.objectContaining({
        assigned_to: {
          link: expect.any(String),
          value: '5137153cc611227c000bbd1bd8cd2007',
        },
        assignment_group: {
          link: expect.any(String),
          value: '287ebd7da9fe198100f92cc8d1d2154e',
        },
      }),
    );
  });
});
