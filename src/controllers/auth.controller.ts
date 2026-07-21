import { NextFunction, Request, Response } from 'express';
import { RequestMeta, TokenPair } from '../types/auth';
import { CreateOrgDTO } from '../types/organization';
import { 
  changePasswordFromAuth,
  signUpWithAuth, 
  signInWithAuth, 
  signOutFromAuth,
  // refresh,
  newRefresh
} from './../services/auth.service'
import { 
  isProfileExistFromDB,
  addAdminProfileToDB,
  getProfileByIdFromDB,
 } from '../services/profiles.service';
import { createOrganization } from '../services/organization.service';
import { createAccessToken, issueRefreshToken} from './../services/jwt.service';
import { AppError } from '../middleware/error.middleware';
import { signInSchema } from '../schema/auth.schema';
import { setAuthCookies, setNewAccessCookie } from '../services/cookies.service';
import { AddAdminProfileDTO } from '../types/profile';

function metaFromRequest(req: Request): RequestMeta {
  return {
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  };
}

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!userId || !orgId) {
      throw new AppError(400, "User required")
    }

    const profile = await getProfileByIdFromDB(userId, orgId)

    res.status(201).json({
      success: true,
      profile,
    });
  } catch (err) {
    next(err)
  }
}

export const adminSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    await signUpWithAuth(req.body);

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify your email.",
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
    
    const cred = req.body;

    if (!cred.email) {
      throw new AppError(400, "Email is required");
    }

    if (!cred.password) {
      throw new AppError(400, "Password is required");
    }

    const auth = await signInWithAuth(cred);

    if (!auth) {
      throw new AppError(401, "User Required");
    }

    if (!auth.user) {
      throw new AppError(401, "Invalid credentials");
    }
    const userId = auth.user.id;
    const userEmail = auth.user.email;
    const user = auth.user.user_metadata;

    const profileExist = await isProfileExistFromDB(userId);

    if (!userEmail) {
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

      const userDetails: AddAdminProfileDTO = {
        id: userId,
        email: userEmail,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: `${user.first_name} ${user.last_name}`,
        org_id: newOrg.id,
      }

      profile = await addAdminProfileToDB(userDetails);
    } else {
      profile = await getProfileByIdFromDB(
        profileExist.id,
        profileExist.org_id
      );
    }

    const accessToken = createAccessToken(profile);

    const refreshToken = await issueRefreshToken(profile.id, profile.org_id, meta);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
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

    const accessToken = createAccessToken(profile);

    const refreshToken = await issueRefreshToken(profile.id, profile.org_id, meta);

    setAuthCookies(res, accessToken, refreshToken);

     return res.status(200).json({
      success: true,
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

    const data = await getProfileByIdFromDB(req.user.sub, req.user.orgId!);

    if (!data?.email) {
      res.status(500).json({ error: "Could not resolve account email" });
      return;
    }

  
    await changePasswordFromAuth({
      id: req.user.sub,
      email: data.email,
      current_password,
      new_password,
    });
    res.status(204).send();
  } catch (err) {
    next(err)
  }
}

export const refreshToken = async (
  req: Request, 
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const meta = metaFromRequest(req);

    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(401).json({
        error: "Refresh token is missing",
      });
      return;
    }

    const tokens: TokenPair =  await newRefresh(refreshToken , meta);

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

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
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      await signOutFromAuth(refreshToken);
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/me/refresh",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};