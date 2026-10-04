import { Request, Response, NextFunction } from "express";

import {
  createInviteService,
  getOrganizationInvitesService,
  revokeInviteService,
  acceptInviteService,
} from "./organization-invites.service";

import {
  getProfileIfExistService,
} from "../profiles/profiles.service";

import { AppError } from "../../middleware/error.middleware";
import { uuidSchema } from "../../schema/global.schema";
import { requireManagerOrOwner } from "../../utils/requirePermission";

export const createOrganizationInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.org_id;
    const createdBy = req.user?.sub;
    const role = req.user?.user_metadata?.role;
    const accessToken = req.cookies.accessToken;

    requireManagerOrOwner(role);

    if (!orgId || !createdBy || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const invite =
      await createInviteService(
        orgId,
        createdBy,
        req.body,
        accessToken
      );

    res.status(201).json({
      success: true,
      message: "Invite created successfully",
      data: invite,
    });
  } catch (err) {
    next(err);
  }
};

export const getInvites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.org_id;
    const role = req.user?.user_metadata?.role;
    const accessToken = req.cookies.accessToken;

    requireManagerOrOwner(role);

    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const invites =
      await getOrganizationInvitesService(
        orgId,
        accessToken
      );

    res.status(200).json({
      success: true,
      data: invites,
    });
  } catch (err) {
    next(err);
  }
};

export const acceptOrganizationInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profileId = req.user?.sub;
    const accessToken = req.cookies.accessToken;

    if (!profileId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const profile =
      await getProfileIfExistService(
        profileId
      );

    if (!profile) {
      throw new AppError(
        404,
        "Accept Invite Failed: Profile not found"
      );
    }

    const member =
      await acceptInviteService(
        req.body.code,
        profile,
        accessToken
      );

    res.status(200).json({
      success: true,
      message: "Organization joined successfully",
      data: member,
    });
  } catch (err) {
    next(err);
  }
};

export const revokeOrganizationInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = req.user?.user_metadata?.role;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    requireManagerOrOwner(role);

    if (!accessToken || !orgId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const inviteId =
      uuidSchema.parse(req.params.id);

    const invite =
      await revokeInviteService(
        inviteId,
        orgId,
        accessToken
      );

    res.status(200).json({
      success: true,
      message: "Invite revoked successfully",
      data: invite,
    });
  } catch (err) {
    next(err);
  }
};