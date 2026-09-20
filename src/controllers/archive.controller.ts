import type { Request, Response, NextFunction } from "express";
import type {
  ArchiveEntity,
  ArchiveListQuery,
} from "../types/archive";

import {
  archiveRecordFromDB,
  getArchivesFromDB,
  restoreRecordFromDB,
} from "../services/archive.service";

import { AppError } from "../middleware/error.middleware";
import { createSupabaseUserClient } from "../config/supabase";

export const getArchives = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;
    const role = req.user?.user_metadata?.role;

    if (
      role !== "owner" &&
      role !== "manager" &&
      role !== "agent"
    ) {
      throw new AppError(403, "Invalid organization role");
    }

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const supabase = createSupabaseUserClient(accessToken);

    const query: ArchiveListQuery = {
      type: req.query.type as ArchiveListQuery["type"],
      entity: req.query.entity as ArchiveListQuery["entity"],
      search: req.query.search as string | undefined,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 25),
    };

    const data = await getArchivesFromDB(
      supabase,
      orgId,
      memberId,
      role,
      query
    );

    return res.status(200).json({
      success: true,
      message: "Archives fetch successful",
      data,
    });
  } catch (err) {
    console.error("GET ARCHIVES ERROR:", err);
    next(err);
  }
};

export const restoreRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const role = req.user?.user_metadata?.role;
    const accessToken = req.cookies.accessToken;

    const entity = req.params.entity as ArchiveEntity;
    const id = req.params.id as string;
    const type = req.query.type as "archived" | "deleted";

    if (
      role !== "owner" &&
      role !== "manager" &&
      role !== "agent"
    ) {
      throw new AppError(403, "Invalid organization role");
    }

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    if (
      !entity ||
      !id ||
      !["archived", "deleted"].includes(type)
    ) {
      throw new AppError(
        400,
        "Entity, record ID, and valid restore type are required"
      );
    }

    const supabase = createSupabaseUserClient(accessToken);

    await restoreRecordFromDB(
      supabase,
      entity,
      id,
      type,
      orgId,
      memberId,
      role
    );

    return res.status(200).json({
      success: true,
      message: "Record restored successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const archiveRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const role = req.user?.user_metadata?.role;
    const accessToken = req.cookies.accessToken;

    const entity = req.params.entity as ArchiveEntity;
    const id = req.params.id as string;

    if (
      role !== "owner" &&
      role !== "manager" &&
      role !== "agent"
    ) {
      throw new AppError(403, "Invalid organization role");
    }

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    if (!entity || !id) {
      throw new AppError(
        400,
        "Entity and record ID are required"
      );
    }

    const supabase = createSupabaseUserClient(accessToken);

    await archiveRecordFromDB(
      supabase,
      orgId,
      memberId,
      role,
      entity,
      id
    );

    return res.status(200).json({
      success: true,
      message: "Record archived successfully",
    });
  } catch (err) {
    next(err);
  }
};