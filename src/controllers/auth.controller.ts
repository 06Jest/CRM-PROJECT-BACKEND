import { NextFunction, Request, Response } from 'express';
import { RequestMeta } from '../types/auth';
import { CreateOrgDTO } from '../types/organization';
import { 
  changePasswordFromAuth,
  signUpWithAuth, 
  signInWithAuth, 
  signOutFromAuth
} from './../services/auth.service'
import { 
  isProfileExistFromDB,
  addAdminProfileToDB,
  getProfileByIdFromDB,
 } from '../services/profiles.service';
import { createOrganization } from '../services/organization.service';
import { createAccessToken } from './../services/jwt.service';
import { issueRefreshToken } from './../services/refresh.service';
import { AppError } from '../middleware/error.middleware';
import { supabaseAdmin } from '../config/supabase';
import { signInSchema } from '../schema/auth.schema';

function metaFromRequest(req: Request): RequestMeta {
  return {
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  };
}

export const adminSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const result = await signUpWithAuth(req.body);

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify your email.",
      data: result,
    });
  } catch (err) {
    next(err)
  }
}

export const adminSignIn = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  try {
    const meta = metaFromRequest(req);

    const auth = await signInWithAuth(req.body);
    const userId = auth.user.id;
    const email = auth.user.email;
    const user = auth.user.user_metadata;

    const profileExist = await isProfileExistFromDB(userId);
    
    if (!email) {
      throw new AppError(400, "Email is required");
    }

    if (!user.first_name || !user.last_name || !user.org_name) {
      throw new AppError(400, "Incomplete registration metadata.");
    }

    let profile;

    if (!profileExist) {
      const orgDTO: CreateOrgDTO = {
        name: user.org_name,
        admin_id: userId,
        subscription_plan: "Free",
      };

      const newOrg = await createOrganization(orgDTO);

      profile = await addAdminProfileToDB({
        id: userId,
        email,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: `${user.first_name} ${user.last_name}`,
        org_id: newOrg.id,
      });
    } else {
      profile = await getProfileByIdFromDB(
        profileExist.id,
        profileExist.org_id
      );
    }

    const accessToken = createAccessToken({
      sub: profile.id,
      role: profile.role,
      orgId: profile.org_id,
    });

    const refreshToken = await issueRefreshToken(profile.id, meta);

    return res.status(200).json({
      success: true,
      tokens : { accessToken, refreshToken },
      profile,
    });
  } catch (err) {
    next(err)
  }
}

export const agentSignIn = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  try {
    const meta = metaFromRequest(req);
    const credentials = signInSchema.parse(req.body) 
    const auth = await signInWithAuth(credentials);
    const userId = auth.user.id;

    const profileExist = await isProfileExistFromDB(userId);
    
    if (!auth) {
      throw new AppError(400, "Account don't exist.");
    }


    if (!profileExist) {
      throw new AppError(400, "Account don't exist.");
    };

    const profile = await getProfileByIdFromDB(profileExist.id, profileExist.org_id)

    const accessToken = createAccessToken({
      sub: profile.id,
      role: profile.role,
      orgId: profile.org_id,
    });

    const refreshToken = await issueRefreshToken(profile.id, meta);

     return res.status(200).json({
      success: true,
      tokens : { accessToken, refreshToken },
      profile,
    });
  } catch (err) {
    next(err)
  }
}

export const changePassword = async (
  req: Request, 
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      currentPassword: current_password,
      newPassword: new_password } = req.body;

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data: profileRow, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", req.user.sub)
      .maybeSingle<{ email: string | null }>();

    if (error || !profileRow?.email) {
      res.status(500).json({ error: "Could not resolve account email" });
      return;
    }

  
    await changePasswordFromAuth({
      id: req.user.sub,
      email: profileRow.email,
      current_password,
      new_password,
    });
    res.status(204).send();
  } catch (err) {
    next(err)
  }
}

export const signOut = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (refreshToken) {
      await signOutFromAuth(refreshToken);
    }

    res.status(204).send();

  } catch (err) {
    next(err)
  }
}