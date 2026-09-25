
import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import type { CallEvent } from "./call-events.types";

class CallEventsPublisher {
  async publish(
    event: Omit<CallEvent, "timestamp">
  ): Promise<void> {
    await pubSubService.publish<CallEvent>(
      PUBSUB_CHANNELS.CALLS,
      {
        ...event,
        timestamp: new Date().toISOString(),
      }
    );
  }

  async created(
    orgId: string,
    memberId: string,
    callId: string
  ): Promise<void> {
    await this.publish({
      type: "created",
      orgId,
      memberId,
      callId,
    });
  }

  async updated(
    orgId: string,
    memberId: string,
    callId: string
  ): Promise<void> {
    await this.publish({
      type: "updated",
      orgId,
      memberId,
      callId,
    });
  }

  async started(
    orgId: string,
    memberId: string,
    callId: string
  ): Promise<void> {
    await this.publish({
      type: "started",
      orgId,
      memberId,
      callId,
    });
  }

  async completed(
    orgId: string,
    memberId: string,
    callId: string
  ): Promise<void> {
    await this.publish({
      type: "completed",
      orgId,
      memberId,
      callId,
    });
  }

  async cancelled(
    orgId: string,
    memberId: string,
    callId: string
  ): Promise<void> {
    await this.publish({
      type: "cancelled",
      orgId,
      memberId,
      callId,
    });
  }

  async archived(
    orgId: string,
    memberId: string,
    callId: string
  ): Promise<void> {
    await this.publish({
      type: "archived",
      orgId,
      memberId,
      callId,
    });
  }

  async deleted(
    orgId: string,
    memberId: string,
    callId: string
  ): Promise<void> {
    await this.publish({
      type: "deleted",
      orgId,
      memberId,
      callId,
    });
  }
}

export default new CallEventsPublisher();

