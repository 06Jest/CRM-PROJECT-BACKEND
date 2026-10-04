import { Request, Response, NextFunction } from "express";

import {
  updateProfileSetupToDB,
  updateProfileFromDB,
  updateProfileStatusFromDB,
  updateProfileAvatarFromDB,
} from "../services/profiles.service";
import {
  getProfileByIdFromDB,
} from "../services/profiles.service";

import { AppError } from "../middleware/error.middleware";
import { metaFromRequest } from "../features/auth/auth.controller";
import { refreshUserSessionService } from "../features/auth/auth.service";
import { setAuthCookies } from "../features/auth/cookies.service";


export const completeProfileSetup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.sub
    const accessToken = req.cookies.accessToken;

    if (!userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }


    const profile =
      await updateProfileSetupToDB(
        userId,
        req.body,
        accessToken
      );


    res.status(200).json({
      success:true,
      message:"Profile setup completed",
      data:profile
    });


  } catch(err){
    next(err);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const userId = req.user?.sub
    const accessToken = req.cookies.accessToken;


    if(!userId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized"
      );
    }


    const profile =
      await updateProfileFromDB(
        userId,
        req.body,
        accessToken
      );

    const session = await refreshUserSessionService(
      userId,
      metaFromRequest(req)
    );

    setAuthCookies(
      res,
      session.tokens.accessToken,
      session.tokens.refreshToken
    );


    res.status(200).json({
      success:true,
      message:"Profile updated successfully",
      data:profile
    });


  } catch(err){
    next(err);
  }
};

export const updateProfileAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;

    if (!userId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const { avatar_url, avatar_file_id } = req.body;

    const avatar = await updateProfileAvatarFromDB(
      userId,
      avatar_url ?? null,
      avatar_file_id ?? null,
      accessToken
    );

    res.status(200).json({
      success: true,
      message: "Profile avatar updated successfully",
      data: avatar,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfileStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.sub
    const accessToken = req.cookies.accessToken;

    if(!userId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const status =
      await updateProfileStatusFromDB(
        userId,
        req.body,
        accessToken
      );

    res.status(200).json({
      success:true,
      message:"Profile status updated successfully",
      data:{
        status
      }
    });


  } catch(err){
    next(err);
  }
};



export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {
    
    const userId = req.user?.sub

    const accessToken =
      req.cookies.accessToken;

    if (
      !userId ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const profile =
      await getProfileByIdFromDB(
        userId,
        accessToken
      );

    res.status(200).json({
      success: true,
      data: profile,
    });

  } catch (err) {
    next(err);
  }

};