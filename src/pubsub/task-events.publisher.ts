import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import { TaskEvent } from "./task-events.types";

class TaskEventsPublisher {
  async publish(
    event: Omit<TaskEvent, "timestamp">
  ): Promise<void> {
    await pubSubService.publish<TaskEvent>(
      PUBSUB_CHANNELS.TASKS,
      {
        ...event,
        timestamp: new Date().toISOString(),
      }
    );
  }

  async created(
    orgId: string,
    memberId: string,
    taskId: string
  ): Promise<void> {
    await this.publish({
      type: "created",
      orgId,
      memberId,
      taskId,
    });
  }

  async updated(
    orgId: string,
    memberId: string,
    taskId: string
  ): Promise<void> {
    await this.publish({
      type: "updated",
      orgId,
      memberId,
      taskId,
    });
  }

  async assigned(
    orgId: string,
    memberId: string,
    taskId: string
  ): Promise<void> {
    await this.publish({
      type: "assigned",
      orgId,
      memberId,
      taskId,
    });
  }

  async completed(
    orgId: string,
    memberId: string,
    taskId: string
  ): Promise<void> {
    await this.publish({
      type: "completed",
      orgId,
      memberId,
      taskId,
    });
  }

  async archived(
    orgId: string,
    memberId: string,
    taskId: string
  ): Promise<void> {
    await this.publish({
      type: "archived",
      orgId,
      memberId,
      taskId,
    });
  }

  async deleted(
    orgId: string,
    memberId: string,
    taskId: string
  ): Promise<void> {
    await this.publish({
      type: "deleted",
      orgId,
      memberId,
      taskId,
    });
  }
}

export default new TaskEventsPublisher();