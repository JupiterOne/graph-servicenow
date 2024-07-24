import { IntegrationIngestionConfigFieldMap } from '@jupiterone/integration-sdk-core';
import { IngestionSources } from './constants';

export const ingestionConfig: IntegrationIngestionConfigFieldMap = {
  [IngestionSources.GROUPS]: {
    title: 'Groups',
    description: 'Fetch User Groups and its members',
  },
  [IngestionSources.INCIDENTS]: {
    title: 'Incidents',
    description: 'Fetch existing incident records',
  },
  [IngestionSources.CMDB_ITEMS]: {
    title: 'CMBD Items',
    description:
      'Fetch CMDB items from configured "cmdb_class" and their relationships with groups and users',
  },
};
