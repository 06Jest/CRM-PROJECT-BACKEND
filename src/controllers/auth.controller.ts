
import { NextFunction, Request, Response } from "express";

import {
  changePasswordFromAuth,
  signUpWithAuth,
  signInWithAuth,
  signOutFromAuth,
  newRefresh,
} from "../services/auth.service";

import {
  getProfileByIdFromDB,
  getProfileByIdForAuthFromDB,
  createProfileToDB,
  getProfileIfExistFromDB,
  checkEmailIfExistFromDB,
} from "../services/profiles.service";

import {
  createAccessToken,
  issueRefreshToken,
} from "../services/jwt.service";

import { AppError } from "../middleware/error.middleware";
import { signInSchema } from "../schema/auth.schema";
import { setAuthCookies } from "../services/cookies.service";
import type { RequestMeta, TokenPair } from "../types/auth";
import { getMembershipForAuthFromDB } from "../services/organization.members.service";


export const metaFromRequest = (
  req: Request
): RequestMeta => ({
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

const getAccessToken = (
  req: Request
): string => {

  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    throw new AppError(
      401,
      "Access token missing"
    );
  }
  return accessToken;
};

const issueSession = async (
  res: Response,
  profile: any,
  meta: RequestMeta
) => {

  const membership =
    profile.onboarding_completed
      ? await getMembershipForAuthFromDB(profile.id)
      : null;

  const accessToken = createAccessToken(
    profile,
    membership
  );

  const refreshToken = await issueRefreshToken(
    profile.id,
    membership?.org_id ?? null,
    meta
  );

  setAuthCookies(
    res,
    accessToken,
    refreshToken
  );
};

export const reIssueSessionForOnboarding = async (
  res: Response,
  profile: any,
  meta: RequestMeta
) => {

  const membership =
    await getMembershipForAuthFromDB(profile.id);


  if (!membership) {
    throw new AppError(
      401,
      "Membership not found"
    );
  }


  const accessToken = createAccessToken(
    profile,
    membership
  );


  const refreshToken =
    await issueRefreshToken(
      profile.id,
      membership.org_id,
      meta
    );


  setAuthCookies(
    res,
    accessToken,
    refreshToken
  );
};


export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {
    const userId = req.user?.sub
    const accessToken = getAccessToken(req);

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const profile = await getProfileByIdFromDB(
      userId,
      accessToken
    );

    res.status(200).json({
      success: true,
      profile,
    });

  } catch (err) {
    next(err);
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const email = req.body.email;

    const existingProfile =
      await checkEmailIfExistFromDB(email);

    if (existingProfile) {
      throw new AppError(
        409,
        "Email is already registered"
      );
    }

    await signUpWithAuth(req.body);
    
    await signUpWithAuth(
      req.body
    );

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify your email.",
    });

  } catch(err) {
    next(err);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const meta = metaFromRequest(req);
    const credentials = signInSchema.parse(req.body);
    const auth = await signInWithAuth(credentials);

    if (!auth?.user) {
      throw new AppError(
        401,
        "Invalid credentials"
      );
    }

    const userId = auth.user.id;
    const userEmail = auth.user.email;

    if (!userEmail) {
      throw new AppError(
        400,
        "Email is required"
      );
    }

    let profile =
      await getProfileIfExistFromDB(
        userId
      );

    let needsOnboarding = false;

    if (!profile) {
      profile =
        await createProfileToDB({
          id: userId,
          email: userEmail,
        });
      needsOnboarding = true;
    } else {
      needsOnboarding =
        !profile.onboarding_completed;

      if (!needsOnboarding) {
        profile =
          await getProfileByIdForAuthFromDB(
            profile.id
          );
      }
    }
    await issueSession(
      res,
      profile,
      meta
    );
    res.status(200).json({
      success: true,
      message:
        "Login successful",
      profile,
      needsOnboarding,
    });
  } catch(err) {
    next(err);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user =
      req.user;
    const accessToken =
      req.cookies?.accessToken;

    if (!user || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      throw new AppError(
        400,
        "Current password and new password are required"
      );
    }

    const profile =
      await getProfileIfExistFromDB(
        user.sub
      );

    if (!profile?.email) {
      throw new AppError(
        404,
        "Profile email not found"
      );
    }

    await changePasswordFromAuth(
      {
        id: user.sub,
        email: profile.email,
        current_password: currentPassword,
        new_password: newPassword,
      },
      accessToken
    );
  
    res.status(204).send();
  } catch(err) {
    next(err);
  }
};

export const refreshUserSession = async (
  res: Response,
  userId: string,
  meta: RequestMeta
) => {

  const profile =
    await getProfileByIdForAuthFromDB(
      userId
    );

  await reIssueSessionForOnboarding(
    res,
    profile,
    meta
  );

  return profile;
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const meta =
      metaFromRequest(req);

    const refreshToken =
      req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError(
        401,
        "Refresh token missing"
      );
    }

    const tokens: TokenPair =
      await newRefresh(
        refreshToken,
        meta
      );

    setAuthCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken
    );
    res.status(204).send();
  } catch(err) {
    next(err);
  }
};

export const signOut = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const refreshToken =
      req.cookies?.refreshToken;
    if (refreshToken) {
      await signOutFromAuth(
        refreshToken
      );
    }

    res.clearCookie(
      "accessToken"
    );

    res.clearCookie(
      "refreshToken"
    );

    res.status(200).json({
      success: true,
      message:
        "Logged out successfully",
    });
  } catch(err) {
    next(err);
  }

};