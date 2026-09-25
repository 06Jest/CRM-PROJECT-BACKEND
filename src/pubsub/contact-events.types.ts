export type ContactEventType =
  | "created"
  | "updated"
  | "deleted"
  | "archived"
  | "bulk_deleted"
  | "bulk_archived";

export interface ContactEvent {
  type: ContactEventType;
  orgId: string;
  memberId: string;
  contactId?: string;
  contactIds?: string[];
  timestamp: string;
}