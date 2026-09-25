import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import { LeadEvent } from "./pubsub.types";

class LeadEventsPublisher {
  async publish(
    event: Omit<LeadEvent, "timestamp">
  ): Promise<void> {
    await pubSubService.publish<LeadEvent>(
      PUBSUB_CHANNELS.LEADS,
      {
        ...event,
        timestamp: new Date().toISOString(),
      }
    );
  }

  async created(
    orgId: string,
    memberId: string,
    leadId: string
  ): Promise<void> {
    await this.publish({
      type: "created",
      orgId,
      memberId,
      leadId,
    });
  }

  async updated(
    orgId: string,
    memberId: string,
    leadId: string
  ): Promise<void> {
    await this.publish({
      type: "updated",
      orgId,
      memberId,
      leadId,
    });
  }

  async deleted(
    orgId: string,
    memberId: string,
    leadId: string
  ): Promise<void> {
    await this.publish({
      type: "deleted",
      orgId,
      memberId,
      leadId,
    });
  }

  async archived(
    orgId: string,
    memberId: string,
    leadId: string
  ): Promise<void> {
    await this.publish({
      type: "archived",
      orgId,
      memberId,
      leadId,
    });
  }

  async converted(
    orgId: string,
    memberId: string,
    leadId: string
  ): Promise<void> {
    await this.publish({
      type: "converted",
      orgId,
      memberId,
      leadId,
    });
  }

  async bulkDeleted(
    orgId: string,
    memberId: string,
    leadIds: string[]
  ): Promise<void> {
    await this.publish({
      type: "bulk_deleted",
      orgId,
      memberId,
      leadIds,
    });
  }

  async bulkArchived(
    orgId: string,
    memberId: string,
    leadIds: string[]
  ): Promise<void> {
    await this.publish({
      type: "bulk_archived",
      orgId,
      memberId,
      leadIds,
    });
  }
}

export default new LeadEventsPublisher();