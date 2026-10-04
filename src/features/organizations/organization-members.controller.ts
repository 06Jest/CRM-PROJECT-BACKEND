import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getMembersListItemService,
  getOrganizationMemberByIdService,
  updateMemberRoleService,
  updateMemberStatusService,
  removeOrganizationMemberService,
  approveJoinMemberService,
  rejectJoinMemberService,
} from "./organization-members.service";

import { AppError } from "../../middleware/error.middleware";
import { uuidSchema } from "../../schema/global.schema";
import { requireManagerOrOwner } from "../../utils/requirePermission";
import type { Roles } from "../../types/global";
import { addActivityService } from "../activities/activities.service";
import { getProfileIfExistService } from "../profiles/profiles.service";

const nextRoleFor = (
  actorRole: Roles,
  targetRole: Roles
): Roles | null => {
  if (actorRole === "owner") {
    if (targetRole === "agent") {
      return "manager";
    }

    if (targetRole === "manager") {
      return "agent";
    }

    return null;
  }

  if (
    actorRole === "manager" &&
    targetRole === "agent"
  ) {
    return "manager";
  }

  return null;
};

const canChangeStatus = (
  actorRole: Roles,
  targetRole: Roles
): boolean => {
  if (targetRole === "owner") {
    return false;
  }

  if (actorRole === "owner") {
    return true;
  }

  if (actorRole === "manager") {
    return targetRole === "agent";
  }

  return false;
};

// Get members list
export const getMembersListItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      await getMembersListItemService(
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

// Update member role
export const updateMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const memberId =
      uuidSchema.parse(req.params.id);

    const actorRole =
      req.user?.user_metadata?.role as
        | Roles
        | undefined;

    const actorProfileId =
      req.user?.sub;

    const orgId =
      req.user?.org_id;

    const memberIdFromAuth =
      req.user?.member_id;

    const accessToken =
      req.cookies.accessToken;

    requireManagerOrOwner(actorRole);

    if (
      !accessToken ||
      !orgId ||
      !actorProfileId ||
      !actorRole ||
      !memberIdFromAuth
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const target =
      await getOrganizationMemberByIdService(
        memberId,
        orgId,
        accessToken
      );

    if (
      target.profile_id === actorProfileId
    ) {
      throw new AppError(
        403,
        "You cannot change your own role."
      );
    }

    const allowedNewRole =
      nextRoleFor(
        actorRole,
        target.role
      );

    if (!allowedNewRole) {
      throw new AppError(
        403,
        "You do not have permission to change this member's role."
      );
    }

    if (
      req.body.role !== allowedNewRole
    ) {
      throw new AppError(
        400,
        `This member's role can only be changed to "${allowedNewRole}".`
      );
    }

    const updated =
      await updateMemberRoleService(
        memberId,
        orgId,
        allowedNewRole,
        accessToken
      );

    if (
      allowedNewRole === "manager"
    ) {
      const targetName = [
        updated.profile?.first_name,
        updated.profile?.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      await addActivityService(
        orgId,
        memberIdFromAuth,
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
      message:
        "Member role updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// Update member status
export const updateMemberStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const memberId =
      uuidSchema.parse(req.params.id);

    const actorRole =
      req.user?.user_metadata?.role as
        | Roles
        | undefined;

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
      await getOrganizationMemberByIdService(
        memberId,
        orgId,
        accessToken
      );

    if (
      target.profile_id === actorProfileId
    ) {
      throw new AppError(
        403,
        "You cannot change your own status."
      );
    }

    if (
      !canChangeStatus(
        actorRole,
        target.role
      )
    ) {
      throw new AppError(
        403,
        "You do not have permission to change this member's status."
      );
    }

    if (
      req.body.status === "removed"
    ) {
      throw new AppError(
        403,
        "This feature is currently unavailable."
      );
    }

    const updated =
      await updateMemberStatusService(
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

// Remove member
export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const memberId =
      uuidSchema.parse(req.params.id);

    const actorProfileId =
      req.user?.sub;

    const actorRole =
      req.user?.user_metadata?.role as
        | Roles
        | undefined;

    const orgId =
      req.user?.org_id;

    const accessToken =
      req.cookies.accessToken;

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
      await getOrganizationMemberByIdService(
        memberId,
        orgId,
        accessToken
      );

    if (
      targetMember.profile_id ===
      actorProfileId
    ) {
      throw new AppError(
        403,
        "You cannot remove yourself."
      );
    }

    if (
      targetMember.role === "owner"
    ) {
      throw new AppError(
        403,
        "The workspace owner cannot be removed."
      );
    }

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
      await removeOrganizationMemberService(
        memberId,
        orgId,
        accessToken
      );

    res.status(200).json({
      success: true,
      message:
        "Member removed successfully",
      data: {
        id: removed.id,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Approve join member
export const approveJoinMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId =
      req.user?.org_id;

    const memberIdFromAuth =
      req.user?.member_id;

    const actorRole =
      req.user?.user_metadata?.role as
        | Roles
        | undefined;

    const memberId =
      uuidSchema.parse(req.params.id);

    const accessToken =
      req.cookies.accessToken;

    requireManagerOrOwner(actorRole);

    if (
      !orgId ||
      !memberIdFromAuth ||
      !accessToken ||
      !actorRole
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const target =
      await getOrganizationMemberByIdService(
        memberId,
        orgId,
        accessToken
      );

    const profile =
      await getProfileIfExistService(
        target.profile_id
      );

    const member =
      await approveJoinMemberService(
        memberId,
        orgId,
        accessToken
      );

    const targetName = [
      profile?.first_name,
      profile?.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    await addActivityService(
      orgId,
      memberIdFromAuth,
      {
        type: "system",
        action: "updated",
        title: "Member approved",
        target_name: targetName,
        description: `Approved ${targetName}'s request to join the organization`,
      },
      accessToken
    );

    res.status(200).json({
      success: true,
      message:
        "Member approved successfully",
      data: member,
    });
  } catch (err) {
    next(err);
  }
};

// Reject join member
export const rejectJoinMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId =
      req.user?.org_id;

    const memberId =
      uuidSchema.parse(req.params.id);

    if (!orgId || !memberId) {
      throw new AppError(
        400,
        "Missing organization or member ID"
      );
    }

    const result =
      await rejectJoinMemberService(
        memberId,
        orgId
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};