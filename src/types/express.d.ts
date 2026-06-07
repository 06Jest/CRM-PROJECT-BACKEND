import 'express';

declare global {
  namespace Express {
    interface Request {
      superAdminId?: string;
      token?: string;
      
      user?: {
        id: string;
        orgId: string;
        role: string;
        isActive: boolean;
        name: string;
      };
    }
  }
}

export {};