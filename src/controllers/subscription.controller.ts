import { Request, Response, NextFunction } from "express";

import {
  createSubscriptionToDB,
  getSubscriptionByOrgIdFromDB,
  updateSubscriptionPlanToDB,
  updateSubscriptionStatusToDB,
} from "../services/subscriptions.service";

import {
  updateOnboardingStepToDB,
  completeOnboardingInDB,
} from "../services/profiles.service";

import { AppError } from "../middleware/error.middleware";
import { metaFromRequest, refreshUserSession } from "./auth.controller";


export const createFreeSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subs = req.body;
    const userId = req.user?.sub
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!userId || !orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const subscription =
      await createSubscriptionToDB(
        orgId,
        {
          plan: subs.plan ?? "Free",
          billing_cycle: subs.billing_cycle ?? "none",
          payment_provider: subs.payment_provider ?? "none",
          provider_reference: subs.provider_reference ?? null,
        },
        accessToken
      );

    await updateOnboardingStepToDB(
      userId,
      3,
      accessToken
    );

    await completeOnboardingInDB(
      userId,
      accessToken
    );

    await refreshUserSession(
      res,
      userId,
      metaFromRequest(req)
    );

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    });

  } catch (err) {
    next(err);
  }
};

export const getSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const subscription =
      await getSubscriptionByOrgIdFromDB(
        orgId,
        accessToken
      );

    res.status(200).json({
      success: true,
      data: subscription,
    });

  } catch (err) {
    next(err);
  }
};



export const updateSubscriptionPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const orgId = req.user?.org_id;
    const role = req.user?.user_metadata?.role;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    if (role !== "owner") {
      throw new AppError(
        403,
        "Only workspace owners can change subscription plans."
      );
    }

    const { plan } = req.body;

    const subscription =
      await updateSubscriptionPlanToDB(
        orgId,
        plan,
        accessToken
      );

    res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      data: subscription,
    });

  } catch (err) {
    next(err);
  }
};



export const updateSubscriptionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const orgId = req.user?.org_id;
    const role = req.user?.user_metadata?.role;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    if (role !== "owner") {
      throw new AppError(
        403,
        "Only workspace owners can change subscription status."
      );
    }

    const { status } = req.body;

    const subscription =
      await updateSubscriptionStatusToDB(
        orgId,
        status,
        accessToken
      );

    res.status(200).json({
      success: true,
      message: "Subscription status updated successfully",
      data: subscription,
    });

  } catch (err) {
    next(err);
  }
};