export type TaskEventType =
  | "created"
  | "updated"
  | "assigned"
  | "completed"
  | "archived"
  | "deleted";

export interface TaskEvent {
  type: TaskEventType;
  orgId: string;
  memberId: string;
  taskId?: string;
  timestamp: string;
}