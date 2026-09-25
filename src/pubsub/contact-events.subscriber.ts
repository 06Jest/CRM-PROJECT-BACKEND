import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import { ContactEvent } from "./contact-events.types";
import cacheService from "../cache/cache.service";

class ContactEventsSubscriber {
  async start(): Promise<void> {
    await pubSubService.subscribe<ContactEvent>(
      PUBSUB_CHANNELS.CONTACTS,
      async (event) => {
        if (!event.orgId) {
          return;
        }

        switch (event.type) {
          case "created":
          case "updated":
          case "deleted":
          case "archived":
          case "bulk_deleted":
          case "bulk_archived":
            await cacheService.deleteByPrefix(
              `contacts:${event.orgId}:`
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

export default new ContactEventsSubscriber();