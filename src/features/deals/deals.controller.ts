import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/error.middleware";
import { uuidSchema } from "../../schema/global.schema";

import {
  addDealService,
  archiveDealService,
  deleteDealService,
  getDealListByIDService,
  getDealsListsByContactIDService,
  getDealsListsService,
  getDealsService,
  updateDealService,
  updateDealStageService,
} from "./deals.service";

export const getDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const deals = await getDealsService(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Deals fetch successful",
      data: deals,
    });
  } catch (err) {
    next(err);
  }
};

export const getDealsLists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const deals = await getDealsListsService(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Deals fetch successful",
      data: deals,
    });
  } catch (err) {
    next(err);
  }
};

export const getDealsListsByContactID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const deals = await getDealsListsByContactIDService(
      id,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Deals fetch successful",
      data: deals,
    });
  } catch (err) {
    next(err);
  }
};

export const getDealListByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const deal = await getDealListByIDService(
      id,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Deal fetch successful",
      data: deal,
    });
  } catch (err) {
    next(err);
  }
};

export const addDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await addDealService(
      orgId,
      memberId,
      req.body,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Add Deal successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateDealService(
      id,
      memberId,
      req.body,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Update Deal successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateDealStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { stage } = req.body;
    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateDealStageService(
      id,
      memberId,
      stage,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Update Deal Stage successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const archiveDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await archiveDealService(
      id,
      memberId,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Archive Deal successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await deleteDealService(
      id,
      memberId,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Delete Deal successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};