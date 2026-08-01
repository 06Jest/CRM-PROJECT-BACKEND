import { Request, Response, NextFunction } from "express";
import { createSupabaseUserClient } from "../config/supabase";
import { AppError } from "./error.middleware";
import { verifyAccessToken } from "../services/jwt.service";
import { table } from "../config/tables";

const tab = table.profile;

export const verifyToken = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AppError(401, "Missing authorization token");
    }

    req.user = verifyAccessToken(token);

    next();
  } catch (err) {
    next(err);
  }
};

export const authenticateUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new AppError(401, "Missing authorization token");
    }

    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    const db = createSupabaseUserClient(accessToken);

    const { data: profile, error } = await db
      .from(tab)
      .select("*")
      .eq("id", req.user.sub)
      .single();

    if (error || !profile) {
      throw new AppError(403, "User not found");
    }

    if (profile.org_id !== req.user.org_id) {
      throw new AppError(403, "Organization mismatch");
    }

    if (profile.role !== req.user.user_metadata.role) {
      throw new AppError(403, "Role mismatch");
    }

    if (profile.status !== "active") {
      throw new AppError(403, "Account deactivated");
    }

    next();
  } catch (err) {
    next(err);
  }
};