import 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Roles } from './global';

export interface AccessTokenPayload extends JwtPayload {
  aud: string | string[];
  iss: string;
  sub: string; 
  role: "authenticated";
  email: string;
  org_id: string | null;
  member_id: string | null;
  user_metadata: {
    role: Roles | null;
  };
}


declare global {
  namespace Express {
    interface Request {
      token?: string;
      user?: AccessTokenPayload;
      profile?: AuthProfile;
    }
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
}

export interface AuthProfile {
  id: string;
  status: string;
  onboarding_completed: boolean;
}

export interface JWTPayload {
  sub: string;
  email: string;
  user_metadata?: {
    org_id?: string;
  };
  role: string;
}

