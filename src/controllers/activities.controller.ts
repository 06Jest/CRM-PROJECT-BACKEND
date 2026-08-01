import { Request, Response, NextFunction } from "express";

import { AppError } from "../middleware/error.middleware";

import { uuidSchema } from "../schema/global.schema";

import {
  getActivitiesFromDB,
  getActivityByIDFromDB,
  getLeadActivitiesFromDB,
  getContactActivitiesFromDB,
  getCustomerActivitiesFromDB,
  getActivitiesByActionFromDB,
  getActivitiesByTypeFromDB,
  addActivityToDB,
  manualAddActivityToDB,
  updateActivityFromDB,
  deleteActivityFromDB,
} from "../services/activities.service";

import type {
  ActivityAction,
  ActivityType,
} from "../types/activity";



export const getActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getActivitiesFromDB(
      orgId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Activities fetch successful",
      data,
    });


  } catch(err){
    next(err);
  }

};



export const getActivityByID = async (
  req:Request,
  res:Response,
  next:NextFunction
)=>{

  try {

    const id = uuidSchema.parse(
      req.params.id
    );


    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if(!orgId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getActivityByIDFromDB(
      id,
      orgId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Activity fetch successful",
      data,
    });


  } catch(err){
    next(err);
  }

};



export const getLeadActivities = async (
  req:Request,
  res:Response,
  next:NextFunction
)=>{

  try {

    const leadId = uuidSchema.parse(
      req.params.leadId
    );

    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if(!orgId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getLeadActivitiesFromDB(
      orgId,
      leadId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Lead activities fetch successful",
      data,
    });


  } catch(err){
    next(err);
  }

};



export const getContactActivities = async (
  req:Request,
  res:Response,
  next:NextFunction
)=>{

  try {

    const contactId = uuidSchema.parse(
      req.params.contactId
    );


    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if(!orgId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getContactActivitiesFromDB(
      orgId,
      contactId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Contact activities fetch successful",
      data,
    });


  } catch(err){
    next(err);
  }

};



export const getCustomerActivities = async (
  req:Request,
  res:Response,
  next:NextFunction
)=>{

  try {

    const customerId = uuidSchema.parse(
      req.params.customerId
    );


    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if(!orgId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getCustomerActivitiesFromDB(
      orgId,
      customerId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Customer activities fetch successful",
      data,
    });


  } catch(err){
    next(err);
  }

};

export const getActivitiesByAction = async (
  req:Request,
  res:Response,
  next:NextFunction
)=>{

  try {

    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if(!orgId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const action =
      req.params.action as ActivityAction;


    const data =
      await getActivitiesByActionFromDB(
        orgId,
        action,
        accessToken
      );


    return res.status(200).json({
      success:true,
      message:"Activities fetch successful",
      data,
    });


  } catch(err){
    next(err);
  }

};



export const getActivitiesByType = async (
  req:Request,
  res:Response,
  next:NextFunction
)=>{

  try {

    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if(!orgId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const type =
      req.params.type as ActivityType;


    const data =
      await getActivitiesByTypeFromDB(
        orgId,
        type,
        accessToken
      );


    return res.status(200).json({
      success:true,
      message:"Activities fetch successful",
      data,
    });


  } catch(err){
    next(err);
  }

};



export const addActivity = async (
  req:Request,
  res:Response,
  next:NextFunction
)=>{

  try {

    const orgId = req.user?.org_id;
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;


    if(!orgId || !userId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await addActivityToDB(
      orgId,
      userId,
      req.body,
      accessToken
    );


    return res.status(201).json({
      success:true,
      message:"Add activity successful",
      data,
    });


  } catch(err){
    next(err);
  }

};



export const manualAddActivity = async (
  req:Request,
  res:Response,
  next:NextFunction
)=>{

  try {

    const orgId = req.user?.org_id;
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;


    if(!orgId || !userId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await manualAddActivityToDB(
        orgId,
        userId,
        req.body,
        accessToken
      );


    return res.status(201).json({
      success:true,
      message:"Manual activity created successful",
      data,
    });


  } catch(err){
    next(err);
  }

};



export const updateActivity = async (
  req:Request,
  res:Response,
  next:NextFunction
)=>{

  try {

    const id = uuidSchema.parse(
      req.params.id
    );


    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if(!orgId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await updateActivityFromDB(
        id,
        orgId,
        req.body,
        accessToken
      );


    return res.status(200).json({
      success:true,
      message:"Update activity successful",
      data,
    });


  } catch(err){
    next(err);
  }

};



export const deleteActivity = async (
  req:Request,
  res:Response,
  next:NextFunction
)=>{

  try {

    const id = uuidSchema.parse(
      req.params.id
    );


    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if(!orgId || !accessToken){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await deleteActivityFromDB(
        id,
        orgId,
        accessToken
      );


    return res.status(200).json({
      success:true,
      message:"Delete activity successful",
      data,
    });


  } catch(err){
    next(err);
  }

};