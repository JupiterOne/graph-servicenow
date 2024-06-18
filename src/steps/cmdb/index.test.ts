import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../test/util/createTestConfig';
import { Steps } from '../../constants';
import { setupServiceNowRecording } from '../../../test/util/recording';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test(
  Steps.CMDB,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(Steps.CMDB);
    recording = setupServiceNowRecording({
      name: Steps.CMDB,
      directory: __dirname,
    });

    const stepResults = await executeStepWithDependencies({
      ...stepTestConfig,
      dependencyStepIds: [Steps.USERS, Steps.GROUPS],
    });
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);
