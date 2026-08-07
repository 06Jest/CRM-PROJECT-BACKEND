import { Request, Response, NextFunction } from "express";
import { createSupabaseUserClient } from "../config/supabase";
import { AppError } from "./error.middleware";
import { verifyAccessToken } from "../services/jwt.service";
import { table } from "../config/tables";

const profileTable = table.profile;

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
      .from(profileTable)
      .select("id")
      .eq("id", req.user.sub)
      .single();

    console.log({
      profile,
      error,
    });

    if (error || !profile) {
      throw new AppError(403, "Profile not found");
    }


    next();
  } catch (err) {
    next(err);
  }
};