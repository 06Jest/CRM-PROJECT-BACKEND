import { Request, Response, NextFunction } from "express";

import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";

import {
  getEmails,
  createDraft,
  updateDraft,
  sendEmail,
  getLeadEmails,
  getContactEmails,
  getCustomerEmails,
  deleteEmail,
} from "../services/email.service";
import { getEmailById } from "../repository/email.repository";

export const getAllEmails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const orgId = req.user?.orgId;


    if (!orgId) {
      throw new AppError(401, "Unauthorized user");
    }


    const data = await getEmails(orgId);


    return res.status(200).json({
      success: true,
      message: "Emails fetch successful",
      data,
    });


  } catch(err) {
    next(err);
  }

};

export const getEmailByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.orgId;


    if(!orgId){
      throw new AppError(401,"Unauthorized user");
    }


    const data = await getEmailById(
      id,
      orgId
    );


    return res.status(200).json({
      success:true,
      message:"Email fetch successful",
      data,
    });


  } catch(err){
    next(err);
  }

};

export const addEmailDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;


    if(!orgId || !userId){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await createDraft(
      orgId,
      userId,
      req.body
    );


    return res.status(201).json({
      success:true,
      message:"Email draft created successfully",
      data,
    });


  } catch(err){
    next(err);
  }

};

export const updateEmailDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.orgId;


    if(!orgId){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await updateDraft(
      id,
      orgId,
      req.body
    );


    return res.status(200).json({
      success:true,
      message:"Email draft updated successfully",
      data,
    });


  } catch(err){
    next(err);
  }

};

export const sendEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.orgId;


    if(!orgId){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await sendEmail(
      id,
      orgId
    );


    return res.status(200).json({
      success:true,
      message:"Email sent successfully",
      data,
    });


  } catch(err){
    next(err);
  }

};

export const getLeadEmailHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const leadId = uuidSchema.parse(
      req.params.leadId
    );

    const orgId = req.user?.orgId;


    if(!orgId){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getLeadEmails(
      orgId,
      leadId
    );


    return res.status(200).json({
      success:true,
      message:"Lead email history fetch successful",
      data,
    });


  } catch(err){
    next(err);
  }

};

export const getContactEmailHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const contactId = uuidSchema.parse(
      req.params.contactId
    );

    const orgId = req.user?.orgId;


    if(!orgId){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getContactEmails(
      orgId,
      contactId
    );


    return res.status(200).json({
      success:true,
      message:"Contact email history fetch successful",
      data,
    });


  } catch(err){
    next(err);
  }

};

export const getCustomerEmailHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const customerId = uuidSchema.parse(
      req.params.customerId
    );

    const orgId = req.user?.orgId;


    if(!orgId){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getCustomerEmails(
      orgId,
      customerId
    );


    return res.status(200).json({
      success:true,
      message:"Customer email history fetch successful",
      data,
    });


  } catch(err){
    next(err);
  }

};

export const removeEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.orgId;


    if(!orgId){
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await deleteEmail(
      id,
      orgId
    );


    return res.status(200).json({
      success:true,
      message:"Email deleted successfully",
      data,
    });


  } catch(err){
    next(err);
  }

};

