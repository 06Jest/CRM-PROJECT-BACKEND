import { Response } from "express";

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) :void => {

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, 
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 24 * 60 * 60 * 1000, 
    path: "/api/auth/refresh",
  });
};

export const setNewAccessCookie = (
  res: Response,
  accessToken: string
) :void => {

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, 
    path: "/",
  });
};