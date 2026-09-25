
import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import type { CallEvent } from "./call-events.types";
import cacheService from "../cache/cache.service";
import {
  callsCachePrefix,
  dashboardCachePrefix,
  analyticsCachePrefix,
} from "../cache/cache-keys";

class CallEventsSubscriber {
  async start(): Promise<void> {
    await pubSubService.subscribe<CallEvent>(
      PUBSUB_CHANNELS.CALLS,
      async (event) => {
        await cacheService.deleteByPrefix(
          callsCachePrefix(event.orgId)
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

export default new CallEventsSubscriber();

