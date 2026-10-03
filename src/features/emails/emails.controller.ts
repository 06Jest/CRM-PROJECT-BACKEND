import {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../../middleware/error.middleware";
import { uuidSchema } from "../../schema/global.schema";

import {
  getEmailsService,
  getEmailByIDService,
  createEmailDraftService,
  updateEmailDraftService,
  getLeadEmailHistoryService,
  getContactEmailHistoryService,
  getCustomerEmailHistoryService,
  deleteEmailService,
  sendEmailService,
} from "./emails.service";

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

    const data = await getEmailsService(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Emails fetch successful",
      data,
    });
  } catch (err) {
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

    const data = await getEmailByIDService(
      id,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Email fetch successful",
      data,
    });
  } catch (err) {
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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await createEmailDraftService(
      orgId,
      memberId,
      req.body,
      accessToken
    );

    return res.status(201).json({
      success: true,
      message: "Email draft created successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const sendEmail = async (
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

    const data = await sendEmailService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data,
    });
  } catch (err) {
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

    const data = await updateEmailDraftService(
      id,
      orgId,
      req.body,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Email draft updated successfully",
      data,
    });
  } catch (err) {
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

    const data =
      await getLeadEmailHistoryService(
        orgId,
        leadId,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message:
        "Lead email history fetch successful",
      data,
    });
  } catch (err) {
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

    const data =
      await getContactEmailHistoryService(
        orgId,
        contactId,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message:
        "Contact email history fetch successful",
      data,
    });
  } catch (err) {
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

    const data =
      await getCustomerEmailHistoryService(
        orgId,
        customerId,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message:
        "Customer email history fetch successful",
      data,
    });
  } catch (err) {
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

    const data = await deleteEmailService(
      id,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Delete Email successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};