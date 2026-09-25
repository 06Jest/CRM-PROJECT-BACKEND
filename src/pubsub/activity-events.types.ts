export type ActivityEventType =
  | "created"
  | "updated"
  | "deleted";

export interface ActivityEvent {
  type: ActivityEventType;
  orgId: string;
  memberId: string;
  activityId?: string;
  timestamp: string;
}