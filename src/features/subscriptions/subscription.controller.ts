import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  createSubscriptionService,
  getSubscriptionService,
  updateSubscriptionPlanService,
  updateSubscriptionStatusService,
  completeSubscriptionOnboardingService,
} from "./subscriptions.service";

import { AppError } from "../../middleware/error.middleware";
import { metaFromRequest } from "../auth/auth.controller";
import { refreshUserSessionService } from "../auth/auth.service";
import { setAuthCookies } from "../auth/cookies.service";

// Create free subscription
export const createFreeSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subs = req.body;

    const userId = req.user?.sub;
    const orgId = req.user?.org_id;
    const accessToken =
      req.cookies.accessToken;

    if (!userId || !orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const subscription =
      await createSubscriptionService(
        orgId,
        {
          plan: subs.plan ?? "Free",
          billing_cycle:
            subs.billing_cycle ?? "none",
          payment_provider:
            subs.payment_provider ?? "none",
          provider_reference:
            subs.provider_reference ?? null,
        },
        accessToken
      );

    await completeSubscriptionOnboardingService(
      userId,
      accessToken
    );

    const session =
      await refreshUserSessionService(
        userId,
        metaFromRequest(req)
      );

    setAuthCookies(
      res,
      session.tokens.accessToken,
      session.tokens.refreshToken
    );

    res.status(201).json({
      success: true,
      message:
        "Subscription created successfully",
      data: subscription,
    });
  } catch (err) {
    next(err);
  }
};

// Get subscription
export const getSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.org_id;
    const accessToken =
      req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    const subscription =
      await getSubscriptionService(
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

// Update subscription plan
export const updateSubscriptionPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.org_id;
    const role =
      req.user?.user_metadata?.role;
    const accessToken =
      req.cookies.accessToken;

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
      await updateSubscriptionPlanService(
        orgId,
        plan,
        accessToken
      );

    res.status(200).json({
      success: true,
      message:
        "Subscription plan updated successfully",
      data: subscription,
    });
  } catch (err) {
    next(err);
  }
};

// Update subscription status
export const updateSubscriptionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.org_id;
    const role =
      req.user?.user_metadata?.role;
    const accessToken =
      req.cookies.accessToken;

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
      await updateSubscriptionStatusService(
        orgId,
        status,
        accessToken
      );

    res.status(200).json({
      success: true,
      message:
        "Subscription status updated successfully",
      data: subscription,
    });
  } catch (err) {
    next(err);
  }
};