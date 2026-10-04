export type NoteEventType =
  | "created"
  | "updated"
  | "pinned"
  | "archived"
  | "deleted";

export interface NoteEvent {
  type: NoteEventType;
  orgId: string;
  memberId: string;
  noteId?: string;
  timestamp: string;
}