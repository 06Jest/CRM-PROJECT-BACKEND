import { NextFunction, Request, Response } from 'express';
import { 
  getProfileNameFromDB,
  updateProfileFromDB,
  getDisplayProfileFromDB,
} from '../services/profiles.service';
import { AppError } from '../middleware/error.middleware';


export const getMemberProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const id = req.body;
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user")
    }
    const result = await getDisplayProfileFromDB(id, orgId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export const getMemberName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const id = req.body;
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user")
    }
    const result = await getProfileNameFromDB(id, orgId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}


export const updateAgentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const  profile  = req.body;
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user")
    }

    const result = await updateProfileFromDB(userId, orgId, profile);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}





