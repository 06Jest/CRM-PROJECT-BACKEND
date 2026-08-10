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
import { metaFromRequest, refreshUserSession } from "./auth.controller";


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

    await refreshUserSession(
      res,
      userId,
      metaFromRequest(req)
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
    const userId = req.user?.sub
    const accessToken = req.cookies.accessToken;

    if(!userId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const avatar =
      await updateProfileAvatarFromDB(
        userId,
        req.body,
        accessToken
      );


    res.status(200).json({
      success:true,
      message:"Profile avatar updated successfully",
      data:{
        avatar_url:avatar
      }
    });


  } catch(err){
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