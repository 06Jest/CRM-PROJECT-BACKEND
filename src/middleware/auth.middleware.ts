import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin} from '../config/supabase';
import { AppError } from './error.middleware';
import { verifyAccessToken } from '../services/jwt.service';


export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "Missing authorization token");
    }

    const token = authHeader.slice(7);

    req.user = verifyAccessToken(token);

    next();
  } catch (err) {
    next(err);
  }
};




export const superAdminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.superAdminId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const response =
      await supabaseAdmin
        .from('profiles')
        .select('role, is_active')
        .eq('id', req.superAdminId)
        .single();

    const profile = response.data;
    const error = response.error;

    if (
      error ||
      !profile ||
      profile.role !== 'super_admin'
    ) {
      return res.status(403).json({
        success: false,
        error:
          'Super admin access required',
      });
    }

    if (!profile.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account deactivated',
      });
    }

    next();
  } catch (err) {
    console.error(
      'Super admin check error:',
      err
    );

    return res.status(403).json({
      success: false,
      error: 'Forbidden',
    });
  }
};



export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  try {
    const authHead = req.headers.authorization;

    if (!authHead?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing authorization token'
      });
    }
    const token = authHead.split(' ')[1];
    

    const { data: authData, error: authError }
    = await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    const userId = authData.user.id;

    const { data: profile, error} 
    = await supabaseAdmin
      .from('profiles')
      .select(`id, name, org_id, role, status`)
      .eq('id', userId)
      .single();


    if ( error || !profile ) {
      return res.status(403).json({
        success: false,
        error:
          'Org admin or member access required'
      });
    }
    
    if ( profile.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account deactivated',
      });
    }

    if (!profile.role) {
      return res.status(403).json({
        success: false ,
        error: `Unauthorized role`,
      });
    }

     req.user = {
      sub: profile.id,
      role: profile.role,
      orgId: profile.org_id
    };
    
    next();

  } catch (err) {
    console.error('Authentication error', err);

    return res.status(500).json({
      success: false,
      error: 'Authentication denied'
    });
  }
};
