import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/error.middleware";
import { uuidSchema } from "../../schema/global.schema";
import {
  getActivitiesService,
  getActivityByIDService,
  getLeadActivitiesService,
  getContactActivitiesService,
  getCustomerActivitiesService,
  getActivitiesByActionService,
  getActivitiesByTypeService,
  addActivityService,
  manualAddActivityService,
  updateActivityService,
  deleteActivityService,
} from "./activities.service";
import type {
  ActivityAction,
  ActivityType,
} from "./activities.types";

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

    const data = await getActivitiesService(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Activities fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getActivityByID = async (
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

    const data = await getActivityByIDService(
      id,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Activity fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getLeadActivities = async (
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

    const data = await getLeadActivitiesService(
      orgId,
      leadId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Lead activities fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getContactActivities = async (
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

    const data = await getContactActivitiesService(
      orgId,
      contactId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Contact activities fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerActivities = async (
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

    const data = await getCustomerActivitiesService(
      orgId,
      customerId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Customer activities fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getActivitiesByAction = async (
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

    const action =
      req.params.action as ActivityAction;

    const data =
      await getActivitiesByActionService(
        orgId,
        action,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message: "Activities fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getActivitiesByType = async (
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

    const type =
      req.params.type as ActivityType;

    const data =
      await getActivitiesByTypeService(
        orgId,
        type,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message: "Activities fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const addActivity = async (
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

    const data = await addActivityService(
      orgId,
      memberId,
      req.body,
      accessToken
    );

    return res.status(201).json({
      success: true,
      message: "Add activity successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const manualAddActivity = async (
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

    const data =
      await manualAddActivityService(
        orgId,
        memberId,
        req.body,
        accessToken
      );

    return res.status(201).json({
      success: true,
      message: "Manual activity created successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateActivity = async (
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

    const data =
      await updateActivityService(
        id,
        orgId,
        memberId,
        req.body,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message: "Update activity successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteActivity = async (
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

    const data =
      await deleteActivityService(
        id,
        orgId,
        memberId,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message: "Delete activity successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

