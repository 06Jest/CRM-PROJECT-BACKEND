import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import { ActivityEvent } from "./activity-events.types";

class ActivityEventsPublisher {
  async publish(
    event: Omit<ActivityEvent, "timestamp">
  ): Promise<void> {
    await pubSubService.publish<ActivityEvent>(
      PUBSUB_CHANNELS.ACTIVITIES,
      {
        ...event,
        timestamp: new Date().toISOString(),
      }
    );
  }

  async created(
    orgId: string,
    memberId: string,
    activityId: string
  ): Promise<void> {
    await this.publish({
      type: "created",
      orgId,
      memberId,
      activityId,
    });
  }

  async updated(
    orgId: string,
    memberId: string,
    activityId: string
  ): Promise<void> {
    await this.publish({
      type: "updated",
      orgId,
      memberId,
      activityId,
    });
  }

  async deleted(
    orgId: string,
    memberId: string,
    activityId: string
  ): Promise<void> {
    await this.publish({
      type: "deleted",
      orgId,
      memberId,
      activityId,
    });
  }
}

export default new ActivityEventsPublisher();