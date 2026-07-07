import { Request, Response, NextFunction } from "express";
import { updateLeadFromDB, addLeadToDB, getLeadsFromDB, deleteLeadFromDB } from "../services/leadsService";
import { AppError } from "../middleware/error.middleware";
import { getProfileByIdFromDB } from '../services/profiles.service'

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
    const userId = req.user?.sub;
    const lead = req.body;

    if (!orgId || !userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await addLeadToDB(orgId, userId, lead);
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
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!id) {
      throw new AppError(
        401,
        'Contact required'
      );
    }
    if (!userId || !orgId ) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await updateLeadFromDB(id, orgId, userId, lead);
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
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!id) {
      throw new AppError(
        401,
        'Lead required'
      );
    }
    if (!userId || !orgId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await deleteLeadFromDB(id, orgId, userId);
    return res.status(200).json({
      success: true,
      message: 'Delete Lead successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

