
import { Request, Response, NextFunction } from "express";
import {
  archiveBulkCustomersService,
  archiveCustomerService,
  deleteBulkCustomersService,
  deleteCustomerService,
  getCustomerByIDService,
  getCustomerListByIDService,
  getCustomersService,
  getCustomersListsService,
  updateCustomerNotesService,
  updateCustomerStatusService,
} from "./customers.service";
import { AppError } from "../../middleware/error.middleware";
import { uuidSchema } from "../../schema/global.schema";

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

    const customers = await getCustomersService(
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

    const customers = await getCustomersListsService(
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

export const getCustomerListByID = async (
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

    const customer = await getCustomerListByIDService(
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

    const customer = await getCustomerByIDService(
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

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateCustomerNotesService(
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

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateCustomerStatusService(
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

export const archiveCustomer = async (
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

    const data = await archiveCustomerService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Archive Customer successful",
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

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await deleteCustomerService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Delete Customer successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const archiveBulkCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ids = req.body.ids;

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError(400, "Customer ids required");
    }

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const validIds = ids.map((id) =>
      uuidSchema.parse(id)
    );

    const data = await archiveBulkCustomersService(
      validIds,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Archive Customers successful",
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

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError(400, "Customer ids required");
    }

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const validIds = ids.map((id) =>
      uuidSchema.parse(id)
    );

    const data = await deleteBulkCustomersService(
      validIds,
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