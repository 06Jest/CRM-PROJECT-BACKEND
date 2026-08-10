import { Request, Response, NextFunction } from "express";

import {
  updateMemberRoleFromDB,
  updateMemberStatusFromDB,
  getMembersListItemFromDB,
  removeOrganizationMemberFromDB,
  getOrganizationMemberByIdFromDB,
  rejectJoinMemberFromDB,
  approvedJoinMemberFromDB,
} from "../services/organization.members.service";

import { AppError } from "../middleware/error.middleware";

import { uuidSchema } from "../schema/global.schema";
import { requireManagerOrOwner } from "../utils/requirePermission";
import type { Roles } from "../types/global";
import { addActivityToDB } from "../services/activities.service";


const nextRoleFor = (actorRole: Roles, targetRole: Roles): Roles | null => {
  if (actorRole === "owner") {
    if (targetRole === "agent") return "manager";
    if (targetRole === "manager") return "agent";
    return null; 
  }

  if (actorRole === "manager" && targetRole === "agent") {
    return "manager";
  }

  return null;
};

const canChangeStatus = (actorRole: Roles, targetRole: Roles): boolean => {
  if (targetRole === "owner") return false;
  if (actorRole === "owner") return true;
  if (actorRole === "manager") return targetRole === "agent";
  return false;
};

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
    const memberId = uuidSchema.parse(req.params.id);

    const actorRole =
      req.user?.user_metadata?.role as Roles | undefined;

    const actorProfileId =
      req.user?.sub;

    const orgId =
      req.user?.org_id;
    
    const mId = req.user?.member_id;



    const accessToken =
      req.cookies.accessToken;

    requireManagerOrOwner(actorRole);

    if (!accessToken || !orgId || !actorProfileId || !actorRole|| !mId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const target = await getOrganizationMemberByIdFromDB(
      memberId,
      orgId,
      accessToken
    );

    if (target.profile_id === actorProfileId) {
      throw new AppError(
        403,
        "You cannot change your own role."
      );
    }

    const allowedNewRole = nextRoleFor(
      actorRole,
      target.role
    );

    if (!allowedNewRole) {
      throw new AppError(
        403,
        "You do not have permission to change this member's role."
      );
    }

    if (req.body.role !== allowedNewRole) {
      throw new AppError(
        400,
        `This member's role can only be changed to "${allowedNewRole}".`
      );
    }

    const updated =
      await updateMemberRoleFromDB(
        memberId,
        orgId,
        allowedNewRole,
        accessToken
      );

    if (allowedNewRole === "manager") {
      const targetName = [
        updated.profile?.first_name,
        updated.profile?.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      await addActivityToDB(
        orgId,
        mId,
        {
          type: "system",
          action: "updated",
          title: "Member promoted",
          target_name: targetName,
          description: `Promoted ${targetName} to manager`,
        },
        accessToken
      );
    }

    res.status(200).json({
      success: true,
      message: "Member role updated successfully",
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
    const memberId = uuidSchema.parse(req.params.id);

    const actorRole =
      req.user?.user_metadata?.role as Roles | undefined;

    const actorProfileId =
      req.user?.sub;

    const orgId =
      req.user?.org_id;

    const accessToken =
      req.cookies.accessToken;

    requireManagerOrOwner(actorRole);

    if (
      !accessToken ||
      !orgId ||
      !actorProfileId ||
      !actorRole
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const target =
      await getOrganizationMemberByIdFromDB(
        memberId,
        orgId,
        accessToken
      );

    if (target.profile_id === actorProfileId) {
      throw new AppError(
        403,
        "You cannot change your own status."
      );
    }

    if (!canChangeStatus(actorRole, target.role)) {
      throw new AppError(
        403,
        "You do not have permission to change this member's status."
      );
    }

    if (req.body.status === 'remove') {
       throw new AppError(
        403,
        "This feature is currently unavailable."
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
      message: "Member status updated successfully",
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
    const memberId = uuidSchema.parse(req.params.id);

    const actorProfileId = req.user?.sub;
    const actorRole =
      req.user?.user_metadata?.role as Roles | undefined;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (
      !accessToken ||
      !orgId ||
      !actorProfileId ||
      !actorRole
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    requireManagerOrOwner(actorRole);

    const targetMember =
      await getOrganizationMemberByIdFromDB(
        memberId,
        orgId,
        accessToken
      );

    // Cannot remove yourself
    if (targetMember.profile_id === actorProfileId) {
      throw new AppError(
        403,
        "You cannot remove yourself."
      );
    }

    // Owner cannot be removed
    if (targetMember.role === "owner") {
      throw new AppError(
        403,
        "The workspace owner cannot be removed."
      );
    }

    // Managers cannot remove other managers
    if (
      actorRole === "manager" &&
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
      message: "Member removed successfully",
      data: {
        id: removed,
      },
    });
  } catch (err) {
    next(err);
  }
};