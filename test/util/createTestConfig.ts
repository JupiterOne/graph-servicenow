import { IntegrationConfig } from '../../src/types';

export function createTestConfig(hostname: string): IntegrationConfig {
  console.log(JSON.stringify(process.env));

  return {
    hostname: process.env.HOSTNAME || hostname,
    username: process.env.USERID || 'default-username',
    password: process.env.PASSWORD || 'default-password',
  };
}
