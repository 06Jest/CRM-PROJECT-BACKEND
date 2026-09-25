import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import { NoteEvent } from "./note-events.types";
import cacheService from "../cache/cache.service";

class NoteEventsSubscriber {
  async start(): Promise<void> {
    await pubSubService.subscribe<NoteEvent>(
      PUBSUB_CHANNELS.NOTES,
      async (event) => {
        if (!event.orgId) return;

        switch (event.type) {
          case "created":
          case "updated":
          case "pinned":
          case "archived":
          case "deleted":
            await cacheService.deleteByPrefix(
              `notes:${event.orgId}:`
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

export default new NoteEventsSubscriber();