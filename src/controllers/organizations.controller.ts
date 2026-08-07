import { Request, Response, NextFunction } from "express";

import {
  createWorkspaceInDB,
  renameWorkspaceInDB,
} from "../services/organization.service";
import { AppError } from "../middleware/error.middleware";
import { updateOnboardingStepToDB } from "../services/profiles.service";
import { createOwnerMemberToDB } from "../services/organization.members.service";
import { metaFromRequest, refreshUserSession } from "./auth.controller";
import { createDefaultConversationsToDB } from "../services/chats/conversation.member.service";

export const createWorkspaceController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.sub
    const accessToken = req.cookies.accessToken;

    if (!userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const dto = req.body;

    const workspace = await createWorkspaceInDB(
      dto
    );


    const member = await createOwnerMemberToDB(
      workspace.id,
      userId
    );

    await createDefaultConversationsToDB(
      workspace.id,
      member.id,
      workspace.type,
      accessToken
    )


    await updateOnboardingStepToDB(
      userId,
      2,
      accessToken
    );

    await refreshUserSession(
      res,
      userId,
      metaFromRequest(req)
    );


    res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: workspace,
    });

  } catch(err) {
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

    if (role !== 'owner') {
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

    const workspace =await renameWorkspaceInDB(orgId, name, accessToken);

    res.status(200).json({
      success: true,
      message: "Workspace renamed successfully",
      data: workspace,
    });

  } catch(err) {
    next(err);
  }
};