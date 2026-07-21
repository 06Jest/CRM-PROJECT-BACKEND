import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin} from '../config/supabase';
import { AppError } from './error.middleware';
import { verifyAccessToken } from '../services/jwt.service';
import { table } from '../config/tables';

const tab = table.profile;

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AppError(401, "Missing authorization token");
    }

    req.user = verifyAccessToken(token);

    next();
  } catch (err) {
    next(err);
  }
};

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  try {

    const token = req.cookies.accessToken;
    

    req.user = verifyAccessToken(token);

    const userId = req.user.sub;
    const orgId = req.user.orgId;


    const { data: profile, error} 
    = await supabaseAdmin
      .from(tab)
      .select('*')
      .eq('id', userId)
      .single();
    

    if ( error || !profile ) {
      return res.status(403).json({
        success: false,
        error:
          `Org admin or member access required`
      });
    }

    if ( profile.role !=='admin' && profile.role !=='agent') {
      return res.status(403).json({
        success: false,
        error:
          'Role does not exist'
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
    
    next();

  } catch (err) {
    next(err);
  }
};
