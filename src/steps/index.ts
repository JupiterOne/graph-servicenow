import {
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../types';
import { Steps, Entities, Relationships, IngestionSources } from '../constants';
import { ServiceNowClient } from '../client';
import {
  createUserEntity,
  createGroupEntity,
  createGroupUserRelationship,
  createGroupGroupRelationship,
  createAccountEntity,
  createIncidentEntity,
  createIncidentAssigneeRelationship,
} from './converters';

export async function createAccount(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { instance, jobState } = context;

  const accountEntity = createAccountEntity(instance.config.hostname);

  await jobState.addEntity(accountEntity);
  await jobState.setData(Entities.ACCOUNT._type, accountEntity);
}

export async function fetchUsers(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { logger, instance, jobState } = context;

  const client = new ServiceNowClient(instance.config, logger);

  const accountEntity = (await jobState.getData(
    Entities.ACCOUNT._type,
  )) as Entity;
  if (!accountEntity) {
    logger.info(
      { _type: Entities.ACCOUNT._type },
      'Did not find an account with that type',
    );
    return;
  }
  await client.iterateUsers(async (user) => {
    const userEntity = await jobState.addEntity(createUserEntity(user));

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: userEntity,
      }),
    );
  });
}

export async function fetchGroups(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { logger, instance, jobState } = context;

  const client = new ServiceNowClient(instance.config, logger);

  const accountEntity = (await jobState.getData(
    Entities.ACCOUNT._type,
  )) as Entity;

  await client.iterateGroups(async (group) => {
    const groupEntity = await jobState.addEntity(createGroupEntity(group));

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: groupEntity,
      }),
    );

    if (group.parent) {
      const groupGroupRelationship = createGroupGroupRelationship(
        groupEntity,
        group.parent,
      );
      await jobState.addRelationship(groupGroupRelationship);
    }
  });
}

export async function buildGroupUserRelationships(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { logger, instance, jobState } = context;

  const client = new ServiceNowClient(instance.config, logger);

  await client.iterateGroupMembers(async (groupMember) => {
    if (!groupMember?.group?.value || !groupMember?.user?.value) return;
    if (
      !jobState.hasKey(
        `${groupMember.group.value}|has|${groupMember.user.value}`,
      ) &&
      jobState.hasKey(groupMember.group.value) &&
      jobState.hasKey(groupMember.user.value)
    ) {
      await jobState.addRelationship(createGroupUserRelationship(groupMember));
    }
  });
}

export async function fetchIncidents(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
) {
  const { logger, instance, jobState } = context;

  const client = new ServiceNowClient(instance.config, logger);

  await client.iterateIncidents(async (incident) => {
    const incidentEntity = createIncidentEntity(incident);
    if (!jobState.hasKey(incidentEntity._key)) {
      await jobState.addEntity(createIncidentEntity(incident));

      if (incident.assigned_to) {
        await jobState.addRelationship(
          createIncidentAssigneeRelationship(incident),
        );
      }
    } else {
      logger.info(
        { incidentKey: incidentEntity._key },
        'Found duplicated key for Incident',
      );
    }
  });
}

export const sysSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: Steps.ACCOUNT,
    name: 'Account',
    entities: [Entities.ACCOUNT],
    relationships: [],
    dependsOn: [],
    executionHandler: createAccount,
  },
  {
    id: Steps.USERS,
    name: 'Users',
    entities: [Entities.USER],
    relationships: [Relationships.ACCOUNT_HAS_USER],
    dependsOn: [Steps.ACCOUNT],
    executionHandler: fetchUsers,
  },
  {
    id: Steps.GROUPS,
    ingestionSourceId: IngestionSources.GROUPS,
    name: 'Groups',
    entities: [Entities.GROUP],
    relationships: [
      Relationships.GROUP_HAS_GROUP,
      Relationships.ACCOUNT_HAS_GROUP,
    ],
    dependsOn: [Steps.ACCOUNT],
    executionHandler: fetchGroups,
  },
  {
    id: Steps.GROUP_MEMBERS,
    ingestionSourceId: IngestionSources.GROUPS,
    name: 'Group Members',
    entities: [],
    relationships: [Relationships.GROUP_HAS_USER],
    dependsOn: [Steps.USERS, Steps.GROUPS],
    executionHandler: buildGroupUserRelationships,
  },
  {
    id: Steps.INCIDENTS,
    ingestionSourceId: IngestionSources.INCIDENTS,
    name: 'Incidents',
    entities: [Entities.INCIDENT],
    relationships: [Relationships.INCIDENT_ASSIGNED_USER],
    dependsOn: [Steps.USERS],
    executionHandler: fetchIncidents,
  },
];
