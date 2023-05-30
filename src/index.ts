import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import instanceConfigFields from './instanceConfigFields';
import { integrationSteps } from './steps';
import { IntegrationConfig } from './types';
import validateInvocation from './validateInvocation';
import { cmdbIntegrationSteps } from './steps/cmdb';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: [...integrationSteps, ...cmdbIntegrationSteps],
};
