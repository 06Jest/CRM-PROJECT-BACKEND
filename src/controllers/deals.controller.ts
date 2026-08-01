import { Request, Response, NextFunction } from "express";
import {
  updateDealFromDB,
  addDealToDB,
  getDealsFromDB,
  deleteDealFromDB,
  updateDealStageFromDB,
  getDealsByIDFromDB,
  getDealsListsFromDB,
  closeDealFromDB,
} from "../services/deals.service";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";
import {
  getContactByIDFromDB,
  updateContactStatusFromDB,
} from "../services/contacts.service";
import { addCustomerToDB } from "../services/customer.service";
import { addActivityToDB } from "../services/activities.service";

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

    const deals = await getDealsFromDB(
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

    const deals = await getDealsListsFromDB(
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

export const addDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;
    const deal = req.body;

    if (!orgId || !userId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const contact = await getContactByIDFromDB(
      deal.contact_id,
      orgId,
      accessToken
    );

    if (contact.status === "Contacted") {
      await updateContactStatusFromDB(
        contact.id,
        orgId,
        userId,
        "Opportunity",
        accessToken
      );
    }

    const data = await addDealToDB(
      orgId,
      userId,
      deal,
      accessToken
    );

    await addActivityToDB(orgId, userId, {
      contact_id: data.contact_id,
      type: "deal",
      action: "created",
      title: "New deal",
      target_name: data.title,
      description: `Created deal ${data.title}`,
    },accessToken);

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
    const deal = req.body;
    const userId = req.user?.sub;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!userId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateDealFromDB(
      id,
      userId,
      deal,
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

    const userId = req.user?.sub;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!userId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    let data;

    const deal = await getDealsByIDFromDB(
      id,
      orgId,
      accessToken
    );

    const contact = await getContactByIDFromDB(
      deal.contact_id,
      orgId,
      accessToken
    );

    if (stage === "Closed Won") {
      if (contact.status !== "Customer") {
        await addCustomerToDB(
          orgId,
          userId,
          contact.id,
          accessToken
        );

        await updateContactStatusFromDB(
          contact.id,
          orgId,
          userId,
          "Customer",
          accessToken
        );

        await addActivityToDB(orgId, userId, {
          contact_id: contact.id,
          type: "customer",
          action: "created",
          title: "New customer",
          target_name:
            `${contact.first_name} ${contact.last_name}`,
          description:
            "Converted contact into customer",
        },accessToken);
      }

      await addActivityToDB(orgId, userId, {
        contact_id: contact.id,
        type: "deal",
        action: "completed",
        title: "Deal won",
        target_name: deal.title,
        description:
          `Won deal ${deal.title}`,
      },accessToken);

      data = await closeDealFromDB(
        id,
        stage,
        userId,
        orgId,
        accessToken
      );
    } else if (stage === "Closed Lost") {
      await addActivityToDB(orgId, userId, {
        contact_id: contact.id,
        type: "deal",
        action: "cancelled",
        title: "Deal lost",
        target_name: deal.title,
        description:
          `Lost deal ${deal.title}`,
      },accessToken);

      data = await closeDealFromDB(
        id,
        stage,
        userId,
        orgId,
        accessToken
      );
    } else {
      data = await updateDealStageFromDB(
        id,
        orgId,
        userId,
        stage,
        accessToken
      );
    }

    return res.status(200).json({
      success: true,
      message: "Update Deal Stage successful",
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

    const userId = req.user?.sub;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!userId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const deleted = await getDealsByIDFromDB(
      id,
      orgId,
      accessToken
    );

    const data = await deleteDealFromDB(
      id,
      userId,
      orgId,
      accessToken
    );

    await addActivityToDB(orgId, userId, {
      contact_id: deleted.contact_id,
      type: "deal",
      action: "deleted",
      title: "Removed deal",
      target_name: deleted.title,
      description:
        `Removed deal ${deleted.title}`,
    },accessToken);

    return res.status(200).json({
      success: true,
      message: "Delete Deal successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};