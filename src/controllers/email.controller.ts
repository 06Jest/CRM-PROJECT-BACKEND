import { Request, Response, NextFunction } from "express";

import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";

import {
  getEmailsFromDB,
  getEmailByIDFromDB,
  createEmailDraftToDB,
  updateEmailDraftFromDB,
  getLeadEmailsFromDB,
  getContactEmailsFromDB,
  getCustomerEmailsFromDB,
  deleteEmailFromDB,
} from "../services/email.service";
import { sendEmailWithResend } from "../services/resend.service";



export const getAllEmails = async (
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


    const data = await getEmailsFromDB(
      orgId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Emails fetch successful",
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

    const id = uuidSchema.parse(
      req.params.id
    );


    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getEmailByIDFromDB(
      id,
      orgId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Email fetch successful",
      data,
    });


  } catch(err) {
    next(err);
  }

};




export const addEmailDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const orgId = req.user?.org_id;
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;


    if (!orgId || !userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await createEmailDraftToDB(
      orgId,
      userId,
      req.body,
      accessToken
    );


    return res.status(201).json({
      success:true,
      message:"Email draft created successfully",
      data,
    });


  } catch(err) {
    next(err);
  }

};

export const sendEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const orgId = req.user?.org_id;
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;


    if (!orgId || !userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const {
      from,
      to,
      subject,
      html,
    } = req.body;


    if (!from || !to || !subject || !html) {
      throw new AppError(
        400,
        "Missing required email fields"
      );
    }


    const data = await sendEmailWithResend({
      from,
      to,
      subject,
      html,
    });


    return res.status(200).json({
      success:true,
      message:"Email sent successfully",
      data,
    });


  } catch(err) {
    next(err);
  }

};




export const updateEmailDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const id = uuidSchema.parse(
      req.params.id
    );


    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await updateEmailDraftFromDB(
      id,
      orgId,
      req.body,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Email draft updated successfully",
      data,
    });


  } catch(err) {
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


    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getLeadEmailsFromDB(
      orgId,
      leadId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Lead email history fetch successful",
      data,
    });


  } catch(err) {
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


    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getContactEmailsFromDB(
      orgId,
      contactId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Contact email history fetch successful",
      data,
    });


  } catch(err) {
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


    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await getCustomerEmailsFromDB(
      orgId,
      customerId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Customer email history fetch successful",
      data,
    });


  } catch(err) {
    next(err);
  }

};




export const removeEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const id = uuidSchema.parse(
      req.params.id
    );


    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await deleteEmailFromDB(
      id,
      orgId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Delete Email successful",
      data,
    });


  } catch(err) {
    next(err);
  }

};