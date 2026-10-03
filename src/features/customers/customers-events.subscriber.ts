import pubSubService from "../../pubsub/pubsub.service";
import { PUBSUB_CHANNELS } from "../../pubsub/pubsub.channels";
import type { CustomerEvent } from "./customers-events.types";
import cacheService from "../../cache/cache.service";
import {
  customersCachePrefix,
  dashboardCachePrefix,
  analyticsCachePrefix,
} from "../../cache/cache-keys";

class CustomerEventsSubscriber {
  async start(): Promise<void> {
    await pubSubService.subscribe<CustomerEvent>(
      PUBSUB_CHANNELS.CUSTOMERS,
      async (event) => {
        await cacheService.deleteByPrefix(
          customersCachePrefix(event.orgId)
        );

        await cacheService.deleteByPrefix(
          dashboardCachePrefix(event.orgId)
        );

        await cacheService.deleteByPrefix(
          analyticsCachePrefix(event.orgId)
        );
      }
    );
  }
}

export default new CustomerEventsSubscriber();