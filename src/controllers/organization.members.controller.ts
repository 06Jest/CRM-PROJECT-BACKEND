import { Request, Response, NextFunction } from "express";

import {
  updateMemberRoleFromDB,
  updateMemberStatusFromDB,
  getMembersListItemFromDB,
  removeOrganizationMemberFromDB,
  getOrganizationMemberByIdFromDB,
} from "../services/organization.members.service";

import { AppError } from "../middleware/error.middleware";

import { uuidSchema } from "../schema/global.schema";
import { requireManagerOrOwner } from "../utils/requirePermission";

export const getMembersListItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const members =
      await getMembersListItemFromDB(
        orgId,
        accessToken
      );

    res.status(200).json({
      success: true,
      data: members,
    });

  } catch (err) {
    next(err);
  }
};


export const updateMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberId =
      uuidSchema.parse(
        req.params.id
      );

    const role =
      req.user?.user_metadata?.role;

    const accessToken =
      req.cookies.accessToken;


    requireManagerOrOwner(role);


    if (!accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }


    const updated =
      await updateMemberRoleFromDB(
        memberId,
        req.body.role,
        accessToken
      );


    res.status(200).json({
      success: true,
      message:
        "Member role updated successfully",
      data: updated,
    });


  } catch (err) {
    next(err);
  }
};


export const updateMemberStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberId =
      uuidSchema.parse(
        req.params.id
      );

    const role =
      req.user?.user_metadata?.role;

    const orgId =
      req.user?.org_id;

    const accessToken =
      req.cookies.accessToken;


    requireManagerOrOwner(role);

    if (!accessToken || !orgId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }


    const updated =
      await updateMemberStatusFromDB(
        memberId,
        orgId,
        req.body.status,
        accessToken
      );


    res.status(200).json({
      success: true,
      message:
        "Member status updated successfully",
      data: updated,
    });


  } catch (err) {
    next(err);
  }
};


export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberId =
      uuidSchema.parse(
        req.params.id
      );

    const currentUser =
      req.user?.sub;

    const orgId =
      req.user?.org_id;

    const role =
      req.user?.user_metadata?.role;

    const accessToken =
      req.cookies.accessToken;


    if (memberId === currentUser) {
      throw new AppError(
        400,
        "You cannot remove yourself"
      );
    }

    if (!accessToken || !orgId || !currentUser) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    if (!["owner", "manager"].includes(role ?? "")) {
      throw new AppError(
        403,
        "Only owners and managers can remove members."
      );
    }

    const targetMember =
      await getOrganizationMemberByIdFromDB(
        memberId,
        orgId,
        accessToken
      );


    if (targetMember.role === "owner") {
      throw new AppError(
        403,
        "The workspace owner cannot be removed."
      );
    }

    if (
      role === "manager" &&
      targetMember.role === "manager"
    ) {
      throw new AppError(
        403,
        "Managers cannot remove other managers."
      );
    }

    const removed =
      await removeOrganizationMemberFromDB(
        memberId,
        orgId,
        accessToken
      );


    res.status(200).json({
      success: true,
      message:
        "Member removed successfully",
      data: {
        id: removed,
      },
    });


  } catch (err) {
    next(err);
  }
};