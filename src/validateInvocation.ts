import {
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { ServiceNowClient } from './client';
import { IntegrationConfig } from './types';
import { validateMultipleClasses } from './util/validateMultipleClasses';

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
    if (config.cmdb_parent.includes(',')) {
      // Ingest multiple classes
      const cmdb_parents = config.cmdb_parent.split(',');
      if (cmdb_parents.length > 10) {
        throw new IntegrationValidationError(
          `This integration only supports up to 10 CMDB classes per instance.`,
        );
      }
      const response = await validateMultipleClasses(
        client,
        cmdb_parents,
        context.logger,
      );

      if (
        response.invalidClasses.length > 0 ||
        response.redundantClasses.length > 0
      ) {
        let error = 'CMDB classes are incorrect. ';
        if (response.invalidClasses.length > 0) {
          error +=
            'The classes: ' +
            response.invalidClasses.toString() +
            " don't exist in your servicenow account. ";
        }
        if (response.redundantClasses.length > 0) {
          error +=
            'The classes: ' +
            response.redundantClasses.toString() +
            ' are redundant, please remove them.';
        }
        throw new IntegrationValidationError(error);
      }
    } else {
      //Ingest only one class
      try {
        await client.validateCMDBParent(config.cmdb_parent);
      } catch (error) {
        throw new IntegrationValidationError(
          `Config requires the input of a valid CMDB parent. ${error.message}`,
        );
      }
    }
  }
}
