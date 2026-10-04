export type CustomerEventType =
  | "created"
  | "updated"
  | "status_updated"
  | "archived"
  | "deleted"
  | "bulk_archived"
  | "bulk_deleted";

export interface CustomerEvent {
  type: CustomerEventType;
  orgId: string;
  memberId: string;
  customerId?: string;
  customerIds?: string[];
  timestamp: string;
}