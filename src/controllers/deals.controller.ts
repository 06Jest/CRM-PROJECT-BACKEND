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
import { ensureResourceLimit } from "../services/plans.service";
import { table } from "../config/tables";

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
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;
    const deal = req.body;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    await ensureResourceLimit(
      orgId,
      table.deals,
      "leads",
      "active_limit",
      accessToken
    );

    const contact = await getContactByIDFromDB(
      deal.contact_id,
      orgId,
      accessToken
    );

    if (contact.status === "Contacted") {
      await updateContactStatusFromDB(
        contact.id,
        orgId,
        memberId,
        "Opportunity",
        accessToken
      );
    }

    const data = await addDealToDB(
      orgId,
      memberId,
      deal,
      accessToken
    );

    await addActivityToDB(orgId, memberId, {
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
    const memberId = req.user?.member_id
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateDealFromDB(
      id,
      memberId,
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

    const memberId = req.user?.member_id
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
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

        await ensureResourceLimit(
          orgId,
          table.customers,
          "customers",
          "active_limit",
          accessToken
        );

        await addCustomerToDB(
          orgId,
          memberId,
          contact.id,
          accessToken
        );

        await updateContactStatusFromDB(
          contact.id,
          orgId,
          memberId,
          "Customer",
          accessToken
        );

        await addActivityToDB(orgId, memberId, {
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

      await addActivityToDB(orgId, memberId, {
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
        memberId,
        orgId,
        accessToken
      );
    } else if (stage === "Closed Lost") {
      await addActivityToDB(orgId, memberId, {
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
        memberId,
        orgId,
        accessToken
      );
    } else {
      data = await updateDealStageFromDB(
        id,
        orgId,
        memberId,
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

    const memberId = req.user?.member_id
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const deleted = await getDealsByIDFromDB(
      id,
      orgId,
      accessToken
    );

    const data = await deleteDealFromDB(
      id,
      memberId,
      orgId,
      accessToken
    );

    await addActivityToDB(orgId, memberId, {
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