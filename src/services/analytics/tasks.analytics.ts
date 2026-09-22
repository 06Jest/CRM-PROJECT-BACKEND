import type {
  AnalyticsParams,
  TaskAnalytics,
  TaskStatusMetric,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

export const getTaskAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<TaskAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const { current } = resolveAnalyticsFilters(filters);

  const { data, error } = await supabase
    .from(table.tasks)
    .select("status, due_date, completed_at")
    .is("deleted_at", null)
    .eq("is_archived", false)
    .gte("created_at", current.start.toISOString())
    .lte("created_at", current.end.toISOString());

  if (error) {
    throw new Error(
      `Failed to fetch task analytics: ${error.message}`,
    );
  }

  const statusMap = new Map<string, TaskStatusMetric>();

  let completedTasks = 0;
  let overdueTasks = 0;

  const now = new Date();

  for (const task of data ?? []) {
    const status = task.status ?? "Unknown";

    const existing = statusMap.get(status);

    if (existing) {
      existing.count += 1;
    } else {
      statusMap.set(status, {
        status,
        count: 1,
      });
    }

    if (task.completed_at) {
      completedTasks += 1;
    }

    if (
      task.due_date &&
      new Date(task.due_date) < now &&
      !task.completed_at
    ) {
      overdueTasks += 1;
    }
  }

  const statuses = Array.from(statusMap.values()).sort(
    (a, b) => b.count - a.count,
  );

  return {
    available: true,
    statuses,
    totalTasks: data?.length ?? 0,
    completedTasks,
    overdueTasks,
  };
};