import { Request, Response, NextFunction } from "express";

import {
  createInvite,
  getOrganizationInvites,
  revokeInvite,
  acceptInvite,
} from "../services/organization.invites.service";

import {
  getProfileIfExistFromDB,
} from "../services/profiles.service";

import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";
import { requireManagerOrOwner } from "../utils/requirePermission";
import { approvedJoinMemberFromDB, getOrganizationMemberByIdFromDB, rejectJoinMemberFromDB } from "../services/organization.members.service";
import { addActivityToDB } from "../services/activities.service";
import { Roles } from "../types/global";


export const createOrganizationInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const orgId =
      req.user?.org_id;

    const createdBy =
      req.user?.sub;

    const role =
      req.user?.user_metadata?.role;

    const accessToken =
      req.cookies.accessToken;

    requireManagerOrOwner(role);

    if (
      !orgId ||
      !createdBy ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const invite =
      await createInvite(
        orgId,
        createdBy,
        req.body,
        accessToken
      );

    res.status(201).json({
      success: true,
      message:
        "Invite created successfully",
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
) => {

  try {

    const orgId =
      req.user?.org_id;

    const role =
      req.user?.user_metadata?.role;

    const accessToken =
      req.cookies.accessToken;

    requireManagerOrOwner(role);

    if (
      !orgId ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const invites =
      await getOrganizationInvites(
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
) => {

  try {

    const profileId =
      req.user?.sub;

    const accessToken =
      req.cookies.accessToken;

    if (
      !profileId ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const profile =
      await getProfileIfExistFromDB(
        profileId
      );

    if (!profile) {
      throw new AppError(
        404,
        "Accept Invite Failed: Profile not found"
      );
    }

    const member =
      await acceptInvite(
        req.body.code,
        profile,
        accessToken
      );

    res.status(200).json({
      success: true,
      message:
        "Organization joined successfully",
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
) => {

  try {

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

    const inviteId =
      uuidSchema.parse(
        req.params.id
      );

    const invite =
      await revokeInvite(
        inviteId,
        orgId,
        accessToken
      );

    res.status(200).json({
      success: true,
      message:
        "Invite revoked successfully",
      data: invite,
    });

  } catch (err) {
    next(err);
  }

};

// export const approveJoinMember = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const orgId = req.user?.org_id;
//     const memberId = uuidSchema.parse(req.params.id);
//     const accessToken = req.cookies.accessToken;

//     if (!orgId || !memberId || !accessToken) {
//       throw new AppError(401, "Unauthorized");
//     }

//     const member = await approvedJoinMemberFromDB(
//       memberId,
//       orgId,
//       accessToken
//     );

//     res.status(200).json({
//       success: true,
//       data: member,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

export const approveJoinMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.org_id;
    const mId = req.user?.member_id;
    const actorRole =
      req.user?.user_metadata?.role as Roles | undefined;

    const memberId = uuidSchema.parse(req.params.id);
    const accessToken = req.cookies.accessToken;

    requireManagerOrOwner(actorRole);

    if (!orgId || !mId || !accessToken || !actorRole) {
      throw new AppError(401, "Unauthorized");
    }

    const target = await getOrganizationMemberByIdFromDB(
      memberId,
      orgId,
      accessToken
    );

    const profile = await getProfileIfExistFromDB(target.profile_id);

    const member = await approvedJoinMemberFromDB(
      memberId,
      orgId,
      accessToken
    );

    const targetName = [
      profile?.first_name,
      profile?.last_name
    ]
      .filter(Boolean)
      .join(" ");

    await addActivityToDB(
      orgId,
      mId,
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
      message: "Member approved successfully",
      data: member,
    });
  } catch (err) {
    next(err);
  }
};

export const rejectJoinMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.org_id;
    const memberId = uuidSchema.parse(req.params.id);

    if (!orgId || !memberId) {
      throw new AppError(400, "Missing organization or member ID");
    }

    const result = await rejectJoinMemberFromDB(
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