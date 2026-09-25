import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import { TaskEvent } from "./task-events.types";
import cacheService from "../cache/cache.service";

class TaskEventsSubscriber {
  async start(): Promise<void> {
    await pubSubService.subscribe<TaskEvent>(
      PUBSUB_CHANNELS.TASKS,
      async (event) => {
        if (!event.orgId) return;

        switch (event.type) {
          case "created":
          case "updated":
          case "assigned":
          case "completed":
          case "archived":
          case "deleted":
            await cacheService.deleteByPrefix(
              `tasks:${event.orgId}:`
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

export default new TaskEventsSubscriber();