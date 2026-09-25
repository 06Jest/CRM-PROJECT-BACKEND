import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import type { ActivityEvent } from "./activity-events.types";
import cacheService from "../cache/cache.service";
import {
  activitiesCachePrefix,
  dashboardCachePrefix,
  analyticsCachePrefix,
} from "../cache/cache-keys";

class ActivityEventsSubscriber {
  async start(): Promise<void> {
    await pubSubService.subscribe<ActivityEvent>(
      PUBSUB_CHANNELS.ACTIVITIES,
      async (event) => {
        await cacheService.deleteByPrefix(
          activitiesCachePrefix(event.orgId)
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

export default new ActivityEventsSubscriber();