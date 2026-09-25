import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import { LeadEvent } from "./pubsub.types";
import cacheService from "../cache/cache.service";

class LeadEventsSubscriber {
  async start(): Promise<void> {
    await pubSubService.subscribe<LeadEvent>(
      PUBSUB_CHANNELS.LEADS,
      async (event) => {
        if (!event.orgId) {
          return;
        }

        switch (event.type) {
          case "created":
          case "updated":
          case "deleted":
          case "archived":
          case "converted":
          case "bulk_deleted":
          case "bulk_archived":
            await cacheService.deleteByPrefix(
              `leads:${event.orgId}:`
            );

            await cacheService.deleteByPrefix(
              `dashboard:${event.orgId}:`
            );

            await cacheService.deleteByPrefix(
              `analytics:${event.orgId}:`
            );

            break;
        }
      }
    );
  }
}

export default new LeadEventsSubscriber();