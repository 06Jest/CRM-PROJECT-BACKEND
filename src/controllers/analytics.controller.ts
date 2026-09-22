import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import { getAnalyticsFromDB } from "../services/analytics/analytics.service";
import type {
  AnalyticsComparison,
  AnalyticsDateRange,
  AnalyticsRole,
  AnalyticsBreakdownDimension,
} from "../types/analytics";

export const getAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;
    const role = req.user?.user_metadata?.role;

    if (!orgId || !memberId || !accessToken || !role) {
      throw new AppError(401, "Unauthorized");
    }

    if (role !== "owner" && role !== "manager") {
      throw new AppError(
        403,
        "Analytics are only available to owners and managers"
      );
    }

    const range =
      (req.query.range as AnalyticsDateRange | undefined) ?? "30d";

    const comparison =
      (req.query.comparison as AnalyticsComparison | undefined) ?? "none";

    const dimension =
      req.query.dimension as AnalyticsBreakdownDimension | undefined;

    const analytics = await getAnalyticsFromDB({
      orgId,
      accessToken,
      memberId,
      role: role as AnalyticsRole,
      filters: {
        range,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        comparison,
        memberId: req.query.memberId as string | undefined,
        source: req.query.source as string | undefined,
        dimension,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Analytics fetch successful",
      data: analytics,
    });
  } catch (err) {
    console.error("Analytics controller error:", err);
    next(err);
  }
};