import { NextFunction, Request, Response } from 'express';
import { 
  updateProfileStatusFromDB,
  updateRoleFromDB,
  getAdminCountFromDB,
  getAllProfilesFromDB,
  addAgentProfileToDB,
  deleteProfileFromDB,
  updateProfileFromDB
 } from '../services/profiles.service';
import { AppError } from '../middleware/error.middleware';
import { uuidSchema } from '../schema/global.schema';


export const getAllMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const orgId = req.user?.orgId;
    const role = req.user?.role;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user")
    }
    if (role === 'agent') {
      throw new AppError(401, "Unauthorized user")
    }

    const result = await getAllProfilesFromDB(orgId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}


export const addAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const profile  = req.body;
    const orgId = req.user?.orgId;
    const userRole = req.user?.role;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user")
    }
    if (userRole === 'agent') {
      throw new AppError(401, "Unauthorized user")
    }

    const result = await addAgentProfileToDB(orgId, profile);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}


export const updateAgentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const status  = req.body;
    const orgId = req.user?.orgId;
    const id  = uuidSchema.parse(req.params.id);
    const userRole = req.user?.role;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user")
    }

    if (!id) {
      throw new AppError(400, "User id required")
    }
    if (userRole === 'agent') {
      throw new AppError(403, "Unauthorized user")
    }

    const result = await updateProfileStatusFromDB(id, orgId, status);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const avatar_url  = req.body;
    const orgId = req.user?.orgId;
    const id  = uuidSchema.parse(req.params.id);
    const userRole = req.user?.role;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user")
    }

    if (!id) {
      throw new AppError(400, "User id required")
    }
    if (userRole === 'agent') {
      throw new AppError(403, "Unauthorized user")
    }

    const result = await updateProfileStatusFromDB(id, orgId, avatar_url);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export const updateAdminProfile = async (
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

export const promoteAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const userId = req.user?.sub;
    const id  = uuidSchema.parse(req.params.id);
    const orgId = req.user?.orgId;
    const userRole = req.user?.role;
    const role = req.body;

    if (!userId || !orgId || !userRole) {
      throw new AppError(403, "Unauthorized user")
    }

    if (userRole === 'agent') {
      throw new AppError(403, "Unauthorized user")
    }

    const admins = await getAdminCountFromDB(orgId);

    if (admins.length >= 3) {
      throw new AppError(409, "Must be maximum of 3 admins every Organization.")
    }

    const result = await updateRoleFromDB(id, orgId, role);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export const demoteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const userId = req.user?.sub;
    const id  = uuidSchema.parse(req.params.id);
    const orgId = req.user?.orgId;
    const userRole = req.user?.role;
    const role = req.body;

    if (!userId || !orgId || !userRole) {
      throw new AppError(403, "Unauthorized user")
    }

    if (userRole === 'agent') {
      throw new AppError(403, "Unauthorized user")
    }

    const admins = await getAdminCountFromDB(orgId);

    if (admins.length <= 1) {
      throw new AppError(409, "Must be minimum of 1 admin every Organization.")
    }

    const result = await updateRoleFromDB(id, orgId, role);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export const deleteAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const id  = req.body;
    const orgId = req.user?.orgId;
    const userRole = req.user?.role;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user")
    }

    if (userRole === 'agent') {
      throw new AppError(403, "Unauthorized user")
    }

    const result = await deleteProfileFromDB(id, orgId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

