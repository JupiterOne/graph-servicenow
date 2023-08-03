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

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  1000_000,
);

test(
  Steps.CMDB_ASSIGNED_USER,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(Steps.CMDB_ASSIGNED_USER);

    recording = setupServiceNowRecording({
      name: Steps.CMDB_ASSIGNED_USER,
      directory: __dirname,
    });

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  1000_000,
);

test(
  Steps.USER_OWNS_CMDB,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(Steps.USER_OWNS_CMDB);

    recording = setupServiceNowRecording({
      name: Steps.USER_OWNS_CMDB,
      directory: __dirname,
    });

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  1000_000,
);

test(
  Steps.USER_MANAGES_CMDB,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(Steps.USER_MANAGES_CMDB);

    recording = setupServiceNowRecording({
      name: Steps.USER_MANAGES_CMDB,
      directory: __dirname,
    });

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  1000_000,
);

test(
  Steps.GROUP_MANAGES_CMDB,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(Steps.GROUP_MANAGES_CMDB);

    recording = setupServiceNowRecording({
      name: Steps.GROUP_MANAGES_CMDB,
      directory: __dirname,
    });

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  1000_000,
);
