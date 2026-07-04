import { Request, Response, NextFunction } from "express";
import { updateDealFromDB, closeDealFromDB, addDealToDB, getDealsFromDB, deleteDealFromDB } from "../services/dealsService";
import { AppError } from "../middleware/error.middleware";

export const getDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    const deals = await getDealsFromDB(orgId);
    return res.status(200).json({
      success: true,
      message: 'Deals fetch successful',
      data: deals, 
      
    });
    
  } catch (err) {
    next(err);
  }
}

export const addDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.id;
    const deal = req.body;

    if (!orgId || !userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await addDealToDB(orgId, userId,  deal);
    return res.status(200).json({
      success: true,
      message: 'Add Deal successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const updateDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.body.id;
    const deal = req.body.deal;
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

    const data = await updateDealFromDB(id, userId, deal);
    return res.status(200).json({
      success: true,
      message: 'Update Deal successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const closeDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.body.id;
    const deal = req.body.deal;
    const outcome = req.body.deal.stage;
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
    if (outcome !== 'Closed Won' || outcome !== 'Closed Lost') {
      throw new AppError(
        401,
        'Invalid stage'
      );
    }

    const data = await closeDealFromDB(id, outcome, userId, deal);
    return res.status(200).json({
      success: true,
      message: 'Update Deal successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}


export const deleteDeal = async (
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
        'Deal required'
      );
    }
    if (!userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await deleteDealFromDB(id, userId);
    return res.status(200).json({
      success: true,
      message: 'Delete Deal successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

