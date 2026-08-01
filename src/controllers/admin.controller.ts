import { NextFunction, Request, Response } from "express";

import {
  updateProfileStatusFromDB,
  updateRoleFromDB,
  // getAdminCountFromDB,
  getAllProfilesFromDB,
  addAgentProfileToDB,
  deleteProfileFromDB,
  updateProfileFromDB,
  updateAvatarFromDB,
} from "../services/profiles.service";

import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";



const getAuthData = (req: Request) => {

  const userId = req.user?.sub;
  const orgId = req.user?.org_id;
  const role = req.user?.role;
  const accessToken = req.cookies?.accessToken;


  if (!userId || !orgId || !role || !accessToken) {
    throw new AppError(
      401,
      "Unauthorized user"
    );
  }


  return {
    userId,
    orgId,
    role,
    accessToken,
  };
};



const checkAdmin = (role: string) => {

  if (role === "agent") {
    throw new AppError(
      403,
      "Insufficient permissions"
    );
  }

};





export const getAllMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const {
      orgId,
      role,
      accessToken,
    } = getAuthData(req);


    checkAdmin(role);



    const result = await getAllProfilesFromDB(
      orgId,
      accessToken
    );


    res.status(200).json({
      success:true,
      data:result,
    });


  } catch(err) {
    next(err);
  }

};






export const addAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const {
      orgId,
      role,
    } = getAuthData(req);


    checkAdmin(role);



    const result = await addAgentProfileToDB(
      orgId,
      req.body
    );


    res.status(201).json({
      success:true,
      data:result,
    });


  } catch(err) {
    next(err);
  }

};






export const updateAgentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const {
      orgId,
      role,
      accessToken,
    } = getAuthData(req);


    checkAdmin(role);



    const id = uuidSchema.parse(
      req.params.id
    );


    const result =
      await updateProfileStatusFromDB(
        id,
        orgId,
        req.body.status,
        accessToken
      );



    res.status(200).json({
      success:true,
      data:result,
    });


  } catch(err) {
    next(err);
  }

};






export const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const {
      orgId,
      role,
      accessToken,
    } = getAuthData(req);


    checkAdmin(role);



    const id = uuidSchema.parse(
      req.params.id
    );


    const result =
      await updateAvatarFromDB(
        id,
        orgId,
        req.body.avatar_url,
        accessToken
      );



    res.status(200).json({
      success:true,
      data:result,
    });


  } catch(err) {
    next(err);
  }

};







export const updateAdminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const {
      userId,
      orgId,
      accessToken,
    } = getAuthData(req);



    const result =
      await updateProfileFromDB(
        userId,
        orgId,
        req.body,
        accessToken
      );



    res.status(200).json({
      success:true,
      data:result,
    });


  } catch(err) {
    next(err);
  }

};
