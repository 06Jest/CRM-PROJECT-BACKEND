import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import { DealEvent } from "./deal-events.types";
import cacheService from "../cache/cache.service";

class DealEventsSubscriber {
  async start(): Promise<void> {
    await pubSubService.subscribe<DealEvent>(
      PUBSUB_CHANNELS.DEALS,
      async (event) => {
        if (!event.orgId) return;

        switch (event.type) {
          case "created":
          case "updated":
          case "stage_updated":
          case "closed":
          case "archived":
          case "deleted":
          case "bulk_deleted":
            await cacheService.deleteByPrefix(
              `deals:${event.orgId}:`
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

export default new DealEventsSubscriber();