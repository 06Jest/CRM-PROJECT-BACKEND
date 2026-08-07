import { Request, Response, NextFunction } from "express";
import {
  deleteBulkCustomersFromDB,
  deleteCustomerFromDB,
  getCustomerByIDFromDB,
  getCustomersFromDB,
  getCustomersListsFromDB,
  updateCustomerNotesFromDB,
  updateCustomerStatusFromDB,
} from "../services/customer.service";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";
import { addActivityToDB } from "../services/activities.service";

export const getCustomers = async (
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

    const customers = await getCustomersFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Customers fetch successful",
      data: customers,
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomersLists = async (
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

    const customers = await getCustomersListsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Customers fetch successful",
      data: customers,
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerByID = async (
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

    const customer = await getCustomerByIDFromDB(
      id,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Customer fetch successful",
      data: customer,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCustomerNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { notes } = req.body;

    const memberId = req.user?.member_id
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateCustomerNotesFromDB(
      id,
      orgId,
      memberId,
      notes,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Update Customer Notes successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCustomerStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { status } = req.body;

    const memberId = req.user?.member_id
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateCustomerStatusFromDB(
      id,
      orgId,
      memberId,
      status,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Update Customer Status successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCustomer = async (
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

    const deleted = await getCustomerByIDFromDB(
      id,
      orgId,
      accessToken
    );

    const data = await deleteCustomerFromDB(
      id,
      orgId,
      memberId,
      accessToken
    );

    await addActivityToDB(orgId, memberId, {
      customer_id: deleted.id,
      type: "customer",
      action: "deleted",
      title: "Removed customer",
      target_name:
        `${deleted.contact?.first_name} ${deleted.contact?.last_name}`,
      description:
        `Removed ${deleted.contact?.first_name} ${deleted.contact?.last_name} as customer`,
    }, accessToken);

    return res.status(200).json({
      success: true,
      message: "Delete Customer successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBulkCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ids = req.body.ids;

    const memberId = req.user?.member_id
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError(
        400,
        "Customer ids required"
      );
    }

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await deleteBulkCustomersFromDB(
      ids,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Delete Customers successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};