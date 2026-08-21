import { Response } from "express";

const isSecure = process.env.COOKIE_SECURE === "true";

const cookieOptions = {
  httpOnly: true,
  secure: isSecure,
  sameSite: isSecure ? ("none" as const) : ("lax" as const),
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 15 * 24 * 60 * 60 * 1000,
    path: "/api/auth/refresh",
  });
};

export const setNewAccessCookie = (
  res: Response,
  accessToken: string
): void => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
};

//Changed