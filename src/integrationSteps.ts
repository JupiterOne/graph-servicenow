import { sysSteps } from './steps';
import { cmdbIntegrationSteps } from './steps/cmdb';
export const integrationSteps = [...sysSteps, ...cmdbIntegrationSteps];
