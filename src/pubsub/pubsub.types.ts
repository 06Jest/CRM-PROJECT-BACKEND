export type LeadEventType =
  | "created"
  | "updated"
  | "deleted"
  | "archived"
  | "converted"
  | "bulk_deleted"
  | "bulk_archived";

export interface LeadEvent {
  type: LeadEventType;
  orgId: string;
  memberId: string;
  leadId?: string;
  leadIds?: string[];
  timestamp: string;
}