import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import getStepStartStates from './getStepStartStates';
import { IntegrationConfig } from './types';
import { invocationConfig } from '.';

describe('getStepStartStates', () => {
  test('all steps represented', () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: {
        hostname: process.env.HOSTNAME || 'dev128112.service-now.com',
        username: process.env.USERNAME || 'valid_username',
        password: process.env.PASSWORD || 'valid_password',
        cmdb_parent: 'cmdb_ci',
      },
    });
    const states = getStepStartStates(context);
    const stepIds = invocationConfig.integrationSteps.map((s) => s.id);
    expect(Object.keys(states).sort()).toEqual(stepIds.sort());
  });
  test('disable cmdb steps if no cmdb_parent is provided', () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: {
        hostname: process.env.HOSTNAME || 'dev128112.service-now.com',
        username: process.env.USERNAME || 'valid_username',
        password: process.env.PASSWORD || 'valid_password',
        cmdb_parent: undefined,
      },
    });
    const states = getStepStartStates(context);
    for (const [key, value] of Object.entries(states)) {
      if (key.includes('cmdb')) {
        expect(value.disabled);
      }
    }
  });
});
