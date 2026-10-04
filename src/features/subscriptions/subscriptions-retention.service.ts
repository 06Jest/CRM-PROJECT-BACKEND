import {
  RETENTION_LIMITS,
} from "./retention";

import {
  getRetentionCutoffDate,
} from "../../utils/retention";

import {
  cleanupActivitiesRetentionInDB,
  cleanupMessagesRetentionInDB,
} from "./subscriptions-retention.repository";

export const cleanupOrganizationRetentionService =
  async (
    orgId: string,
    plan: keyof typeof RETENTION_LIMITS
  ): Promise<void> => {
    const policy =
      RETENTION_LIMITS[plan];

    if (policy.activities !== null) {
      const cutoff =
        getRetentionCutoffDate(
          policy.activities
        );

      await cleanupActivitiesRetentionInDB(
        orgId,
        cutoff
      );
    }

    if (policy.messages !== null) {
      const cutoff =
        getRetentionCutoffDate(
          policy.messages
        );

      await cleanupMessagesRetentionInDB(
        orgId,
        cutoff
      );
    }
  };