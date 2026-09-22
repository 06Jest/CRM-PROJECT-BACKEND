import type {
  AnalyticsComparison,
  AnalyticsDateFilter,
  AnalyticsDateRange,
  AnalyticsFilters,
} from "../../types/analytics";

export interface AnalyticsDateWindow {
  start: Date;
  end: Date;
}

export interface AnalyticsFilterContext {
  current: AnalyticsDateWindow;
  comparison?: AnalyticsDateWindow;
  memberId?: string;
  source?: string;
}

const getStartOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getEndOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const getStartOfYear = (date: Date): Date => {
  return new Date(date.getFullYear(), 0, 1);
};

const resolveCustomRange = (
  filter: AnalyticsDateFilter,
): AnalyticsDateWindow => {
  if (!filter.startDate || !filter.endDate) {
    throw new Error(
      "Custom analytics date range requires startDate and endDate",
    );
  }

  const start = new Date(filter.startDate);
  const end = new Date(filter.endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new Error("Invalid analytics date range");
  }

  if (start > end) {
    throw new Error(
      "Analytics start date cannot be after end date",
    );
  }

  return {
    start: getStartOfDay(start),
    end: getEndOfDay(end),
  };
};

export const resolveAnalyticsDateRange = (
  filter: AnalyticsDateFilter,
  now = new Date(),
): AnalyticsDateWindow => {
  const end = getEndOfDay(now);

  switch (filter.range) {
    case "today":
      return {
        start: getStartOfDay(now),
        end,
      };

    case "7d":
      return {
        start: getStartOfDay(subtractDays(now, 6)),
        end,
      };

    case "30d":
      return {
        start: getStartOfDay(subtractDays(now, 29)),
        end,
      };

    case "90d":
      return {
        start: getStartOfDay(subtractDays(now, 89)),
        end,
      };

    case "this_year":
      return {
        start: getStartOfYear(now),
        end,
      };

    case "custom":
      return resolveCustomRange(filter);

    default: {
      const exhaustiveCheck: never = filter.range;
      throw new Error(
        `Unsupported analytics date range: ${exhaustiveCheck}`,
      );
    }
  }
};

export const resolveComparisonRange = (
  current: AnalyticsDateWindow,
  comparison: AnalyticsComparison,
): AnalyticsDateWindow | undefined => {
  if (comparison === "none") {
    return undefined;
  }

  const duration =
    current.end.getTime() - current.start.getTime();

  if (comparison === "previous_period") {
    const end = new Date(current.start.getTime() - 1);
    const start = new Date(end.getTime() - duration);

    return {
      start,
      end,
    };
  }

  if (comparison === "previous_year") {
    const start = new Date(current.start);
    const end = new Date(current.end);

    start.setFullYear(start.getFullYear() - 1);
    end.setFullYear(end.getFullYear() - 1);

    return {
      start,
      end,
    };
  }

  return undefined;
};

export const resolveAnalyticsFilters = (
  filters: AnalyticsFilters,
  now = new Date(),
): AnalyticsFilterContext => {
  const current = resolveAnalyticsDateRange(filters, now);

  const comparison = resolveComparisonRange(
    current,
    filters.comparison,
  );

  return {
    current,
    comparison,
    memberId: filters.memberId,
    source: filters.source,
  };
};