import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  getCurrentUserService,
  signUpService,
  oauthLoginService,
  demoLoginService,
  signInService,
  changePasswordService,
  refreshTokenService,
  signOutService,
} from "./auth.service";


import {
  AppError,
} from "../../middleware/error.middleware";

import {
  signInSchema,
} from "./auth.schema";

import {
  setAuthCookies,
} from "./cookies.service";

import type {
  RequestMeta,
} from "./auth.types";

export const metaFromRequest = (
  req: Request
): RequestMeta => ({
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

const getAccessToken = (
  req: Request
): string => {
  const accessToken =
    req.cookies?.accessToken;

  if (!accessToken) {
    throw new AppError(
      401,
      "Access token missing"
    );
  }

  return accessToken;
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      req.user?.sub;

    const accessToken =
      getAccessToken(req);

    if (!userId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const profile =
      await getCurrentUserService(
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
    await signUpService(
      req.body
    );

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify your email.",
    });
  } catch (err) {
    next(err);
  }
};


export const oauthLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const meta =
      metaFromRequest(req);

    const authorization =
      req.headers.authorization;

    if (
      !authorization?.startsWith(
        "Bearer "
      )
    ) {
      throw new AppError(
        401,
        "Supabase access token missing"
      );
    }

    const supabaseAccessToken =
      authorization.replace(
        "Bearer ",
        ""
      );

    const result =
      await oauthLoginService(
        supabaseAccessToken,
        meta
      );

    setAuthCookies(
      res,
      result.tokens.accessToken,
      result.tokens.refreshToken
    );

    res.status(200).json({
      success: true,
      message:
        "OAuth login successful",
      profile: result.profile,
      needsOnboarding:
        result.needsOnboarding,
    });
  } catch (err) {
    next(err);
  }
};


export const demoLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const meta =
      metaFromRequest(req);

    const result =
      await demoLoginService(
        meta
      );

    setAuthCookies(
      res,
      result.tokens.accessToken,
      result.tokens.refreshToken
    );

    res.status(200).json({
      success: true,
      message:
        "Demo login successful",
      profile: result.profile,
      needsOnboarding: false,
    });
  } catch (err) {
    next(err);
  }
};


export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const meta =
      metaFromRequest(req);

    const credentials =
      signInSchema.parse(
        req.body
      );

    const result =
      await signInService(
        credentials,
        meta
      );

    setAuthCookies(
      res,
      result.tokens.accessToken,
      result.tokens.refreshToken
    );

    res.status(200).json({
      success: true,
      message:
        "Login successful",
      profile: result.profile,
      needsOnboarding:
        result.needsOnboarding,
    });
  } catch (err) {
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

    if (
      !user ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const {
      currentPassword,
      newPassword,
    } = req.body;

    await changePasswordService(
      user.sub,
      accessToken,
      currentPassword,
      newPassword
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};


export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const meta =
      metaFromRequest(req);

    const rawRefreshToken =
      req.cookies?.refreshToken;

    if (!rawRefreshToken) {
      throw new AppError(
        401,
        "Refresh token missing"
      );
    }

    const tokens =
      await refreshTokenService(
        rawRefreshToken,
        meta
      );

    setAuthCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken
    );

    res.status(204).send();
  } catch (err) {
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

    await signOutService(
      refreshToken
    );

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
  } catch (err) {
    next(err);
  }
};