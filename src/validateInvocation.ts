import {
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { ServiceNowClient } from './client';
import { IntegrationConfig } from './types';
import {
  getParsedCMDBClassList,
  validateMultipleClasses,
} from './util/cmdbHierarchyUtils';

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
  let response;
  try {
    if (config.cmdb_parent) {
      const cmdb_parents = getParsedCMDBClassList(config.cmdb_parent);
      if (cmdb_parents.length > 10) {
        throw new IntegrationValidationError(
          `This integration only supports up to 10 CMDB classes per instance. Please update config to specify 10 or fewer.`,
        );
      }
      response = await validateMultipleClasses(
        client,
        cmdb_parents,
        context.logger,
      );
    }
  } catch (error) {
    throw new IntegrationValidationError(
      `Invalid configuration of cmdb. Error: ${error.message}`,
    );
  }

  if (response?.invalidClasses?.length > 0) {
    throw new IntegrationValidationError(
      'CMDB classes are incorrect. ' +
        'The class(es): ' +
        response.invalidClasses.join(', ') +
        " don't exist in your ServiceNow account. ",
    );
  }
}
