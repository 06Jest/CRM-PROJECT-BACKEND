import pubSubService from "./pubsub.service";
import { PUBSUB_CHANNELS } from "./pubsub.channels";
import { NoteEvent } from "./note-events.types";

class NoteEventsPublisher {
  async publish(
    event: Omit<NoteEvent, "timestamp">
  ): Promise<void> {
    await pubSubService.publish<NoteEvent>(
      PUBSUB_CHANNELS.NOTES,
      {
        ...event,
        timestamp: new Date().toISOString(),
      }
    );
  }

  async created(
    orgId: string,
    memberId: string,
    noteId: string
  ): Promise<void> {
    await this.publish({
      type: "created",
      orgId,
      memberId,
      noteId,
    });
  }

  async updated(
    orgId: string,
    memberId: string,
    noteId: string
  ): Promise<void> {
    await this.publish({
      type: "updated",
      orgId,
      memberId,
      noteId,
    });
  }

  async pinned(
    orgId: string,
    memberId: string,
    noteId: string
  ): Promise<void> {
    await this.publish({
      type: "pinned",
      orgId,
      memberId,
      noteId,
    });
  }

  async archived(
    orgId: string,
    memberId: string,
    noteId: string
  ): Promise<void> {
    await this.publish({
      type: "archived",
      orgId,
      memberId,
      noteId,
    });
  }

  async deleted(
    orgId: string,
    memberId: string,
    noteId: string
  ): Promise<void> {
    await this.publish({
      type: "deleted",
      orgId,
      memberId,
      noteId,
    });
  }
}

export default new NoteEventsPublisher();