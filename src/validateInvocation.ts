import {
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { ServiceNowClient } from './client';
import { IntegrationConfig } from './types';

export default async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;
  if (!config.hostname || !config.username || !config.password) {
    throw new IntegrationValidationError(
      'Config requires all of {hostname, username, password}',
    );
  }

  const client = new ServiceNowClient(config, context.logger);
  await client.validate();
  if (config.cmdb_parent) {
    try {
      await client.validateCMDBParent(config.cmdb_parent);
    } catch (error) {
      throw new IntegrationValidationError(
        `Config requires the input of a valid CMDB parent. ${error.message}`,
      );
    }
  }
}
