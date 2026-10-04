import { Request, Response, NextFunction } from "express";

import {
  createWorkspaceService,
  getWorkspaceService,
  renameWorkspaceService,
  updateWorkspaceDetailsService,
} from "./organization.service";

import { AppError } from "../../middleware/error.middleware";
import {
  getProfileIfExistFromDB,
} from "../profiles/profiles.repository";
import { acceptInviteService } from "./organization-invites.service";
import { metaFromRequest } from "../auth/auth.controller";
import { refreshUserSessionService } from "../auth/auth.service";
import { setAuthCookies } from "../auth/cookies.service";

export const createWorkspaceController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;

    if (!userId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const workspace = await createWorkspaceService(
      req.body,
      userId,
      accessToken
    );

    const session = await refreshUserSessionService(
      userId,
      metaFromRequest(req)
    );

    setAuthCookies(
      res,
      session.tokens.accessToken,
      session.tokens.refreshToken
    );

    res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: workspace,
    });
  } catch (err) {
    next(err);
  }
};

export const joinOrganization = async (
  req: Request<{ code: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.sub;
    const { code } = req.params;
    const accessToken = req.cookies.accessToken;

    if (!userId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const profile = await getProfileIfExistFromDB(userId);

    if (!profile) {
      throw new AppError(
        404,
        "Accept Invite Failed: Profile not found"
      );
    }

    const workspace = await acceptInviteService(
      code,
      profile,
      accessToken
    );

    res.status(200).json({
      success: true,
      message: "Invite Accepted successfully",
      data: workspace,
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkspaceData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId) {
      throw new AppError(
        400,
        "Organization ID is required"
      );
    }

    if (!accessToken) {
      throw new AppError(
        401,
        "Access token missing"
      );
    }

    const workspace = await getWorkspaceService(
      orgId,
      accessToken
    );

    res.status(200).json({
      success: true,
      message: "Workspace fetched successfully",
      data: workspace,
    });
  } catch (err) {
    next(err);
  }
};

export const renameWorkspaceController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.org_id;
    const role = req.user?.user_metadata.role;
    const { name } = req.body;
    const accessToken = req.cookies.accessToken;

    if (!orgId) {
      throw new AppError(
        400,
        "Organization ID is required"
      );
    }

    if (role !== "owner") {
      throw new AppError(
        400,
        "Only the workspace owner can rename the workspace."
      );
    }

    if (!accessToken) {
      throw new AppError(
        401,
        "Access token missing"
      );
    }

    if (!name) {
      throw new AppError(
        400,
        "Workspace name is required"
      );
    }

    const workspace = await renameWorkspaceService(
      orgId,
      name,
      accessToken
    );

    res.status(200).json({
      success: true,
      message: "Workspace renamed successfully",
      data: workspace,
    });
  } catch (err) {
    next(err);
  }
};

export const updateWorkspaceDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.org_id;
    const role = req.user?.user_metadata?.role;
    const accessToken = req.cookies.accessToken;

    if (!orgId) {
      throw new AppError(
        400,
        "Organization ID is required"
      );
    }

    if (role !== "owner" && role !== "manager") {
      throw new AppError(
        403,
        "Only the workspace owner or a manager can edit workspace details."
      );
    }

    if (!accessToken) {
      throw new AppError(
        401,
        "Access token missing"
      );
    }

    const workspace = await updateWorkspaceDetailsService(
      orgId,
      req.body,
      accessToken
    );

    res.status(200).json({
      success: true,
      message: "Workspace details updated successfully",
      data: workspace,
    });
  } catch (err) {
    next(err);
  }
};