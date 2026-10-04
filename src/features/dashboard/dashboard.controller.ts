import {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../../middleware/error.middleware";

import {
  getDashboardService,
} from "./dashboard.service";

import type { DashboardRole } from "./dashboard.types";


export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;
    const role = req.user?.user_metadata?.role;

    if (
      !orgId ||
      !memberId ||
      !accessToken ||
      !role
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    if (
      role !== "owner" &&
      role !== "manager" &&
      role !== "agent"
    ) {
      throw new AppError(
        403,
        "Invalid dashboard role"
      );
    }

    const dashboard =
      await getDashboardService({
        orgId,
        accessToken,
        memberId,
        role: role as DashboardRole,
      });

    res.status(200).json({
      success: true,
      message: "Dashboard fetch successful",
      data: dashboard,
    });
  } catch (err) {
    next(err);
  }
};