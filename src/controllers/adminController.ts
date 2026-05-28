import { Request, Response, NextFunction } from 'express';
import { getDashboardStats } from '../services/dashboardService';
import { banUser, unbanUser, deleteUser } from '../services/userService';
import { pauseOrganization, resumeOrganization, deleteOrganization } from '../services/organizationService';
import { AppError } from '../middleware/error.middleware';


export const dashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await getDashboardStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    next(new AppError(500, 'Failed to fetch dashboard statistics'));
  }
};

export const banUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, reason } = req.body;

    if (!userId || !reason) {
      throw new AppError(400, 'userId and reason are required');
    }

    if (!req.superAdminId) {
      throw new AppError(401, 'User ID not found in token');
    }


    const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';

    await banUser(userId, reason, req.superAdminId, ipAddress);

    return res.status(200).json({
      success: true,
      message: 'User banned successfully',
    });
  } catch (err) {
    next(err);
  }
};


export const unbanUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new AppError(400, 'userId is required');
    }

    if (!req.superAdminId) {
      throw new AppError(401, 'User ID not found in token');
    }

    const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';

    await unbanUser(userId, req.superAdminId, ipAddress);

    return res.status(200).json({
      success: true,
      message: 'User unbanned successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new AppError(400, 'userId is required');
    }

    if (!req.superAdminId) {
      throw new AppError(401, 'User ID not found in token');
    }

    const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';

    await deleteUser(userId, req.superAdminId, ipAddress);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const pauseOrgController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId } = req.body;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    if (!req.superAdminId) {
      throw new AppError(401, 'User ID not found in token');
    }

    const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';

    await pauseOrganization(orgId, req.superAdminId, ipAddress);

    return res.status(200).json({
      success: true,
      message: 'Organization paused successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const resumeOrgController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId } = req.body;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    if (!req.superAdminId){
      throw new AppError(401, 'User ID not found in token');
    }

    const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';

    await resumeOrganization(orgId, req.superAdminId, ipAddress);

    return res.status(200).json({
      success: true,
      message: 'Organization resumed successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const deleteOrgController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId } = req.body;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    if (!req.superAdminId) {
      throw new AppError(401, 'User ID not found in token');
    }

    const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';

    await deleteOrganization(orgId, req.superAdminId, ipAddress);

    return res.status(200).json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};