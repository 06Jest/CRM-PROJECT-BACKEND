import { Request, Response, NextFunction } from "express";
import { getAllMembersIDNamesFromDB } from "../services/profiles.service";
import { AppError } from "../middleware/error.middleware";

export const getAllMembersIDNames = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    const leads = await getAllMembersIDNamesFromDB(orgId);
    return res.status(200).json({
      success: true,
      message: 'Leads fetch successful',
      data: leads, 
    });
    
  } catch (err) {
    next(err);
  }
}