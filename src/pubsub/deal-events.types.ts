export type DealEventType =
  | "created"
  | "updated"
  | "stage_updated"
  | "closed"
  | "archived"
  | "deleted"
  | "bulk_deleted";

export interface DealEvent {
  type: DealEventType;
  orgId: string;
  memberId: string;
  dealId?: string;
  dealIds?: string[];
  timestamp: string;
}