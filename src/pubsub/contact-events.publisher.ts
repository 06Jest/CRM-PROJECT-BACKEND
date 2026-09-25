import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import { ContactEvent } from "./contact-events.types";

class ContactEventsPublisher {
  async publish(
    event: Omit<ContactEvent, "timestamp">
  ): Promise<void> {
    await pubSubService.publish<ContactEvent>(
      PUBSUB_CHANNELS.CONTACTS,
      {
        ...event,
        timestamp: new Date().toISOString(),
      }
    );
  }

  async created(
    orgId: string,
    memberId: string,
    contactId: string
  ): Promise<void> {
    await this.publish({
      type: "created",
      orgId,
      memberId,
      contactId,
    });
  }

  async updated(
    orgId: string,
    memberId: string,
    contactId: string
  ): Promise<void> {
    await this.publish({
      type: "updated",
      orgId,
      memberId,
      contactId,
    });
  }

  async deleted(
    orgId: string,
    memberId: string,
    contactId: string
  ): Promise<void> {
    await this.publish({
      type: "deleted",
      orgId,
      memberId,
      contactId,
    });
  }

  async archived(
    orgId: string,
    memberId: string,
    contactId: string
  ): Promise<void> {
    await this.publish({
      type: "archived",
      orgId,
      memberId,
      contactId,
    });
  }

  async bulkDeleted(
    orgId: string,
    memberId: string,
    contactIds: string[]
  ): Promise<void> {
    await this.publish({
      type: "bulk_deleted",
      orgId,
      memberId,
      contactIds,
    });
  }

  async bulkArchived(
    orgId: string,
    memberId: string,
    contactIds: string[]
  ): Promise<void> {
    await this.publish({
      type: "bulk_archived",
      orgId,
      memberId,
      contactIds,
    });
  }
}

export default new ContactEventsPublisher();