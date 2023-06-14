import {
  IntegrationExecutionContext,
  StepStartStates,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from './types';
import { integrationSteps } from './integrationSteps';

export default function getStepStartStates(
  executionContext: IntegrationExecutionContext<IntegrationConfig>,
): StepStartStates {
  const stepIds = integrationSteps.map((step) => step.id);

  const stepStartStates = stepIds.reduce((states, stepId) => {
    states[stepId] = {
      disabled:
        stepId.includes('cmdb') &&
        !executionContext.instance.config.cmdb_parent,
    };
    return states;
  }, {} as StepStartStates);
  return stepStartStates;
}
