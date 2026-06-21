import { Request, Response, NextFunction } from "express";
import { updateLeadFromDB, addLeadToDB, getLeadsFromDB, deleteLeadFromDB } from "../services/leadsService";
import { AppError } from "../middleware/error.middleware";

export const getLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    const leads = await getLeadsFromDB(orgId);
    return res.status(200).json({
      success: true,
      message: 'Leads fetch successful',
      data: leads, 
      
    });
    
  } catch (err) {
    next(err);
  }
}

export const addLead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const name = req.user?.name;
    const userId = req.user?.id;
    const lead = req.body;

    if (!orgId || !name || !userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await addLeadToDB(orgId, userId, name, lead);
    return res.status(200).json({
      success: true,
      message: 'Add Lead successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const updateLead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.body.id;
    const lead = req.body.lead;
    const userId = req.user?.id;

    if (!id) {
      throw new AppError(
        401,
        'Contact required'
      );
    }
    if (!userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await updateLeadFromDB(id, userId, lead);
    return res.status(200).json({
      success: true,
      message: 'Update Lead successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const deleteLead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.body;
    const userId = req.user?.id;

    if (!id) {
      throw new AppError(
        401,
        'Lead required'
      );
    }
    if (!userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await deleteLeadFromDB(id, userId);
    return res.status(200).json({
      success: true,
      message: 'Delete Lead successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

