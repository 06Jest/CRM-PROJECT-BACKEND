import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import type { JWTPayload } from '../types';
import { supabaseAdmin } from '../utils/supabase';

interface SuperAdminSession {
  super_admin_id: string;
  expires_at: string;
} 


declare global {
  namespace Express {
    interface Request {
      superAdminId?: string;
      token?: string;
    }
  }
}


export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing authorization token',
      });
    }

    const token = authHeader.substring(7);

    req.token = token;


    const response = await supabaseAdmin
      .rpc('verify_super_admin_session', {
        p_token: token,
      })
      .single();

    const session = response.data as SuperAdminSession | null;;
    const error = response.error;

    if (error || !session) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session',
      });
    }


    if (
      new Date(session.expires_at) <
      new Date()
    ) {
      return res.status(401).json({
        success: false,
        error: 'Session expired',
      });
    }

    req.superAdminId =
      session.super_admin_id;

    next();
  } catch (err) {
    console.error(
      'Session verification error:',
      err
    );

    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
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
