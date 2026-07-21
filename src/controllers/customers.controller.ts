import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";
import { addCustomerToDB, deleteBulkCustomersFromDB, deleteCustomerFromDB, getCustomersFromDB, getCustomersListsFromDB, updateCustomerNotesFromDB, updateCustomerStatusFromDB } from "../services/customer.service";

export const getCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    const customers = await getCustomersFromDB(orgId);
    return res.status(200).json({
      success: true,
      message: 'Customers fetch successful',
      data: customers, 
      
    });
    
  } catch (err) {
    next(err);
  }
}

export const getCustomersLists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    const customers = await getCustomersListsFromDB(orgId);
    return res.status(200).json({
      success: true,
      message: 'Customers fetch successful',
      data: customers, 
      
    });
    
  } catch (err) {
    next(err);
  }
}

export const updateCustomerNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { notes } = req.body;
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!id) {
      throw new AppError(
        401,
        'Customer required'
      );
    }

    if (!userId || !orgId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await updateCustomerNotesFromDB(id, orgId, userId, notes);
    return res.status(200).json({
      success: true,
      message: 'Update Customer Notes successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const updateCustomerStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { status } = req.body;
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!id) {
      throw new AppError(
        401,
        'Customer required'
      );
    }

    if (!userId || !orgId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await updateCustomerStatusFromDB(id, orgId, userId, status);
    return res.status(200).json({
      success: true,
      message: 'Update Customer Status successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!id) {
      throw new AppError(
        401,
        'Customer required'
      );
    }
    if (!userId || !orgId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await deleteCustomerFromDB(id, orgId, userId);
    return res.status(204).json({
      success: true,
      message: 'Delete Customer successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}
export const deleteBulkCustomers= async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ids = req.body.ids;
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!ids) {
      throw new AppError(
        401,
        'Customer required'
      );
    }
    if (!userId || !orgId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await deleteBulkCustomersFromDB(ids, orgId, userId);

    res.status(200).json({
      success: true,
      message: 'Delete Customer successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};
