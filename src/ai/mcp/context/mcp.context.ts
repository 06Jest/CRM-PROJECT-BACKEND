import { Request } from "express";
import { AppError } from "../../../middleware/error.middleware";
import { AIRequestContext } from "../../types/ai.types";

export const getMcpRequestContext = (
  req: Request
): AIRequestContext => {
  const accessToken = req.cookies.accessToken;
  const user = req.user;

  if (!accessToken) {
    throw new AppError(
      401,
      "Missing authorization token."
    );
  }

  if (!user) {
    throw new AppError(
      401,
      "Unauthorized."
    );
  }

  if (!user.sub) {
    throw new AppError(
      401,
      "Profile context is missing."
    );
  }

  if (!user.org_id) {
    throw new AppError(
      400,
      "Organization context is required."
    );
  }

  if (!user.member_id) {
    throw new AppError(
      400,
      "Organization member context is required."
    );
  }

  const role = user.user_metadata?.role;

  if (
    role !== "owner" &&
    role !== "manager" &&
    role !== "agent"
  ) {
    throw new AppError(
      403,
      "Valid organization role is required."
    );
  }

  return {
    profileId: user.sub,
    orgId: user.org_id,
    memberId: user.member_id,
    role,
    accessToken,
  };
};