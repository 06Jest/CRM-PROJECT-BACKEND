import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import type { CustomerEvent } from "./customer-events.types";

class CustomerEventsPublisher {
  async publish(
    event: Omit<CustomerEvent, "timestamp">
  ): Promise<void> {
    await pubSubService.publish<CustomerEvent>(
      PUBSUB_CHANNELS.CUSTOMERS,
      {
        ...event,
        timestamp: new Date().toISOString(),
      }
    );
  }

  async created(
    orgId: string,
    memberId: string,
    customerId: string
  ): Promise<void> {
    await this.publish({
      type: "created",
      orgId,
      memberId,
      customerId,
    });
  }

  async updated(
    orgId: string,
    memberId: string,
    customerId: string
  ): Promise<void> {
    await this.publish({
      type: "updated",
      orgId,
      memberId,
      customerId,
    });
  }

  async statusUpdated(
    orgId: string,
    memberId: string,
    customerId: string
  ): Promise<void> {
    await this.publish({
      type: "status_updated",
      orgId,
      memberId,
      customerId,
    });
  }

  async archived(
    orgId: string,
    memberId: string,
    customerId: string
  ): Promise<void> {
    await this.publish({
      type: "archived",
      orgId,
      memberId,
      customerId,
    });
  }

  async deleted(
    orgId: string,
    memberId: string,
    customerId: string
  ): Promise<void> {
    await this.publish({
      type: "deleted",
      orgId,
      memberId,
      customerId,
    });
  }

  async bulkArchived(
    orgId: string,
    memberId: string,
    customerIds: string[]
  ): Promise<void> {
    await this.publish({
      type: "bulk_archived",
      orgId,
      memberId,
      customerIds,
    });
  }

  async bulkDeleted(
    orgId: string,
    memberId: string,
    customerIds: string[]
  ): Promise<void> {
    await this.publish({
      type: "bulk_deleted",
      orgId,
      memberId,
      customerIds,
    });
  }
}

export default new CustomerEventsPublisher();