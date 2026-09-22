import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import { getDashboardFromDB } from "../services/dashboard.service";
import type { DashboardRole } from "../types/dashboard";

export const getDashboard = async (
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

    if (
      role !== "owner" &&
      role !== "manager" &&
      role !== "agent"
    ) {
      throw new AppError(403, "Invalid dashboard role");
    }

    const dashboard = await getDashboardFromDB({
      orgId,
      accessToken,
      memberId,
      role: role as DashboardRole,
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard fetch successful",
      data: dashboard,
    });
  } catch (err) {
    next(err);
  }
};