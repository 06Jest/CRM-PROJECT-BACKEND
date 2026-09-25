import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import { DealEvent } from "./deal-events.types";

class DealEventsPublisher {
  async publish(
    event: Omit<DealEvent, "timestamp">
  ): Promise<void> {
    await pubSubService.publish<DealEvent>(
      PUBSUB_CHANNELS.DEALS,
      {
        ...event,
        timestamp: new Date().toISOString(),
      }
    );
  }

  async created(
    orgId: string,
    memberId: string,
    dealId: string
  ): Promise<void> {
    await this.publish({
      type: "created",
      orgId,
      memberId,
      dealId,
    });
  }

  async updated(
    orgId: string,
    memberId: string,
    dealId: string
  ): Promise<void> {
    await this.publish({
      type: "updated",
      orgId,
      memberId,
      dealId,
    });
  }

  async stageUpdated(
    orgId: string,
    memberId: string,
    dealId: string
  ): Promise<void> {
    await this.publish({
      type: "stage_updated",
      orgId,
      memberId,
      dealId,
    });
  }

  async closed(
    orgId: string,
    memberId: string,
    dealId: string
  ): Promise<void> {
    await this.publish({
      type: "closed",
      orgId,
      memberId,
      dealId,
    });
  }

  async archived(
    orgId: string,
    memberId: string,
    dealId: string
  ): Promise<void> {
    await this.publish({
      type: "archived",
      orgId,
      memberId,
      dealId,
    });
  }

  async deleted(
    orgId: string,
    memberId: string,
    dealId: string
  ): Promise<void> {
    await this.publish({
      type: "deleted",
      orgId,
      memberId,
      dealId,
    });
  }

  async bulkDeleted(
    orgId: string,
    memberId: string,
    dealIds: string[]
  ): Promise<void> {
    await this.publish({
      type: "bulk_deleted",
      orgId,
      memberId,
      dealIds,
    });
  }
}

export default new DealEventsPublisher();