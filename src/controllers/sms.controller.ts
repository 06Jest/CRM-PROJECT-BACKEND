import { Request, Response, NextFunction } from "express";

import { AppError } from "../middleware/error.middleware";

import { uuidSchema } from "../schema/global.schema";

import {
  getSmsFromDB,
  getSmsByIDFromDB,
  getLeadSmsFromDB,
  getContactSmsFromDB,
  getSmsByStatusFromDB,
  addSmsToDB,
  updateSmsStatusFromDB,
  // deleteSmsFromDB,
} from "../services/sms.service";

import type {
  SmsStatus,
} from "../types/sms";

import { addActivityToDB } from "../services/activities.service";
import { ensureResourceLimit } from "../services/plans.service";
import { table } from "../config/tables";



export const getSms = async (
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


    const data = await getSmsFromDB(
      orgId,
      accessToken
    );


    return res.status(200).json({
      success: true,
      message: "SMS fetch successful",
      data,
    });


  } catch (err) {
    next(err);
  }
};



export const getSmsByID = async (
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


    const data = await getSmsByIDFromDB(
      id,
      orgId,
      accessToken
    );


    return res.status(200).json({
      success: true,
      message: "SMS fetch successful",
      data,
    });


  } catch (err) {
    next(err);
  }
};



export const getLeadSms = async (
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


    const data = await getLeadSmsFromDB(
      orgId,
      leadId,
      accessToken
    );


    return res.status(200).json({
      success: true,
      message: "Lead SMS fetch successful",
      data,
    });


  } catch (err) {
    next(err);
  }
};



export const getContactSms = async (
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


    const data = await getContactSmsFromDB(
      orgId,
      contactId,
      accessToken
    );


    return res.status(200).json({
      success: true,
      message: "Contact SMS fetch successful",
      data,
    });


  } catch (err) {
    next(err);
  }
};

export const getSmsByStatus = async (
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

    const status =
      req.params.status as SmsStatus;


    const data = await getSmsByStatusFromDB(
      orgId,
      status,
      accessToken
    );


    return res.status(200).json({
      success: true,
      message: "SMS fetch successful",
      data,
    });

  } catch (err) {
    next(err);
  }
};



export const addSms = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;


    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const sms = req.body;


    if (
      sms.lead_id &&
      sms.contact_id
    ) {
      throw new AppError(
        400,
        "SMS can only belong to either lead or contact"
      );
    }


    if (
      !sms.lead_id &&
      !sms.contact_id
    ) {
      throw new AppError(
        400,
        "SMS requires a lead or contact"
      );
    }
    await ensureResourceLimit(
      orgId,
      table.sms,
      "sms",
      "active_limit",
      accessToken
    );


    const data = await addSmsToDB(
      orgId,
      memberId,
      sms,
      accessToken
    );


    const targetName =
      data.lead
        ? `${data.lead.first_name} ${data.lead.last_name}`
        : data.contact
          ? `${data.contact.first_name} ${data.contact.last_name}`
          : "Unknown";


    await addActivityToDB(
      orgId,
      memberId,
      {
        lead_id: data.lead_id,
        contact_id: data.contact_id,
        type: "sms",
        action: "sent",
        title: "SMS sent",
        target_name: targetName,
        description: `Sent SMS to ${targetName}`,
      },
      accessToken
    );


    return res.status(201).json({
      success: true,
      message: "Add SMS successful",
      data,
    });


  } catch (err) {
    next(err);
  }
};



export const updateSmsStatus = async (
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


    const { status } = req.body;


    const existing = await getSmsByIDFromDB(
      id,
      orgId,
      accessToken
    );


    if (
      existing.status === "delivered"
    ) {
      throw new AppError(
        400,
        "Delivered SMS cannot be updated"
      );
    }


    if (
      existing.status === "failed"
    ) {
      throw new AppError(
        400,
        "Failed SMS cannot be updated"
      );
    }


    const data = await updateSmsStatusFromDB(
      id,
      orgId,
      status,
      accessToken
    );


    return res.status(200).json({
      success: true,
      message: "Update SMS status successful",
      data,
    });


  } catch (err) {
    next(err);
  }
};