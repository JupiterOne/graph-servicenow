import { StepTestConfig } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../src/types';
import { invocationConfig } from '../../src';
import * as dotenv from 'dotenv';
import * as path from 'path';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../../.env'),
  });
}
export function createTestConfig(hostname: string): IntegrationConfig {
  return {
    hostname: process.env.HOSTNAME || hostname,
    username: process.env.USERNAME || 'default-username',
    password: process.env.PASSWORD || 'default-password',
    cmdb_parent: process.env.CMDB_PARENT || 'cmdb_ci_service_business',
  };
}
export const configFromEnv: IntegrationConfig = {
  hostname: process.env.HOSTNAME || 'default-hostname',
  username: process.env.USERNAME || 'default-username',
  password: process.env.PASSWORD || 'default-password',
  cmdb_parent: process.env.CMDB_PARENT || 'cmdb_ci_service_business',
};

export function getStepTestConfigForStep(
  stepId: string,
): StepTestConfig<any, IntegrationConfig> {
  return {
    stepId,
    instanceConfig: configFromEnv,
    invocationConfig: {
      ...invocationConfig,
    } as any,
  };
}
