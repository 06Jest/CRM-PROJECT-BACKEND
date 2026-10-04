
export type CallEventType =
  | "created"
  | "updated"
  | "started"
  | "completed"
  | "cancelled"
  | "archived"
  | "deleted";

export interface CallEvent {
  type: CallEventType;
  orgId: string;
  memberId: string;
  callId?: string;
  timestamp: string;
}

