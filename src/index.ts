import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import instanceConfigFields from './instanceConfigFields';
import { IntegrationConfig } from './types';
import validateInvocation from './validateInvocation';
import getStepStartStates from './getStepStartStates';
import { integrationSteps } from './integrationSteps';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields,
  validateInvocation,
  getStepStartStates,
  integrationSteps: integrationSteps,
};
