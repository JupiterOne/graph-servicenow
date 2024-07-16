import {
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { ServiceNowClient } from './client';
import { IntegrationConfig } from './types';
import { validateMultipleClasses } from './util/cmdbHierarchyUtils';

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
  //Validate CMDB configuration.
  if (config.cmdb_parent) {
    const cmdb_parents = config.cmdb_parent
      .split(',')
      .filter((className) => className != '');
    if (cmdb_parents.length > 10) {
      throw new IntegrationValidationError(
        `This integration only supports up to 10 CMDB classes per instance. Please update config to specify 10 or fewer.`,
      );
    }
    const response = await validateMultipleClasses(
      client,
      cmdb_parents,
      context.logger,
    );

    if (response.invalidClasses.length > 0) {
      throw new IntegrationValidationError(
        'CMDB classes are incorrect. ' +
          'The classes: ' +
          response.invalidClasses.join(', ') +
          " don't exist in your servicenow account. ",
      );
    }
  }
}
