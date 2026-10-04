import {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../../middleware/error.middleware";
import { uuidSchema } from "../../schema/global.schema";

import {
  getSmsService,
  getSmsByIDService,
  getLeadSmsService,
  getContactSmsService,
  getSmsByStatusService,
  addSmsService,
  updateSmsStatusService,
  archiveSmsService,
} from "./sms.service";

import type {
  SmsStatus,
} from "./sms.types";

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

    const data = await getSmsService(
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

    const data = await getSmsByIDService(
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

    const data = await getLeadSmsService(
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

    const data = await getContactSmsService(
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

    const data = await getSmsByStatusService(
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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await addSmsService(
      orgId,
      memberId,
      req.body,
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

export const archiveSms = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(
      req.params.id
    );

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await archiveSmsService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Archive SMS successful",
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

    const data = await updateSmsStatusService(
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