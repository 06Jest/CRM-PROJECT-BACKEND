import { NextFunction, Request, Response } from "express";

import {
  changePasswordFromAuth,
  signUpWithAuth,
  signInWithAuth,
  signOutFromAuth,
  newRefresh,
} from "../services/auth.service";

import {
  isProfileExistFromDB,
  addAdminProfileToDB,
  getProfileByIdFromDB,
  getProfileByIdForAuthFromDB,
} from "../services/profiles.service";

import { createOrganization } from "../services/organization.service";
import {
  createAccessToken,
  issueRefreshToken,
} from "../services/jwt.service";

import { AppError } from "../middleware/error.middleware";
import { signInSchema } from "../schema/auth.schema";
import { setAuthCookies } from "../services/cookies.service";
import { createNewConversationToDB } from "../services/chats/conversation.service";

import type { RequestMeta, TokenPair } from "../types/auth";


const metaFromRequest = (
  req: Request
): RequestMeta => ({
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});



const getAccessToken = (
  req: Request
): string => {

  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    throw new AppError(
      401,
      "Access token missing"
    );
  }

  return accessToken;
};



const issueSession = async (
  res: Response,
  profile: any,
  meta: RequestMeta
) => {

  const accessToken =
    createAccessToken(profile);


  const refreshToken =
    await issueRefreshToken(
      profile.id,
      profile.org_id,
      meta
    );


  setAuthCookies(
    res,
    accessToken,
    refreshToken
  );
};



export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const userId = req.user?.sub;
    const orgId = req.user?.org_id;

    const accessToken =
      getAccessToken(req);


    if (!userId || !orgId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }


    const profile =
      await getProfileByIdFromDB(
        userId,
        orgId,
        accessToken
      );


    res.status(200).json({
      success:true,
      profile,
    });


  } catch(err) {
    next(err);
  }

};




export const adminSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    await signUpWithAuth(
      req.body
    );


    res.status(201).json({
      success:true,
      message:
        "Registration successful. Please verify your email.",
    });


  } catch(err) {
    next(err);
  }

};




export const adminSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const meta =
      metaFromRequest(req);


    const credentials =
      signInSchema.parse(req.body);



    const auth =
      await signInWithAuth(
        credentials
      );


    if (!auth?.user) {
      throw new AppError(
        401,
        "Invalid credentials"
      );
    }



    const userId =
      auth.user.id;


    const userEmail =
      auth.user.email;


    const metadata =
      auth.user.user_metadata;



    if (!userEmail) {
      throw new AppError(
        400,
        "Email is required"
      );
    }



    if (
      !metadata.first_name ||
      !metadata.last_name ||
      !metadata.org_name
    ) {
      throw new AppError(
        400,
        "Incomplete registration metadata"
      );
    }



    const existingProfile =
      await isProfileExistFromDB(
        userId
      );



    let profile;



    if (!existingProfile) {


      const organization =
        await createOrganization({
          name: metadata.org_name,
          admin_id: userId,
          subscription_plan:"Free",
        });



      profile =
        await addAdminProfileToDB({
          id:userId,
          email:userEmail,
          first_name:metadata.first_name,
          last_name:metadata.last_name,
          display_name:
            `${metadata.first_name} ${metadata.last_name}`,
          org_id:organization.id,
        });



      await Promise.all([
        createNewConversationToDB(
          organization.id,
          userId,
          "announcement",
        ),

        createNewConversationToDB(
          organization.id,
          userId,
          "organization"
        ),
      ]);



    } else {


      profile =
        await getProfileByIdForAuthFromDB(
          existingProfile.id,
          existingProfile.org_id
        );

    }



    await issueSession(
      res,
      profile,
      meta
    );



    res.status(200).json({
      success:true,
      message:"Login Successful",
      profile,
    });


  } catch(err) {
    next(err);
  }

};

export const agentSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const meta = metaFromRequest(req);

    const credentials = signInSchema.parse(req.body);

    const auth = await signInWithAuth(credentials);

    if (!auth?.user) {
      throw new AppError(
        401,
        "Invalid credentials"
      );
    }


    const profileExist = await isProfileExistFromDB(
      auth.user.id
    );


    if (!profileExist) {
      throw new AppError(
        403,
        "Profile does not exist"
      );
    }


    const profile = await getProfileByIdForAuthFromDB(
      profileExist.id,
      profileExist.org_id
    );


    const accessToken = createAccessToken(profile);


    const refreshToken = await issueRefreshToken(
      profile.id,
      profile.org_id,
      meta
    );


    setAuthCookies(
      res,
      accessToken,
      refreshToken
    );


    res.status(200).json({
      success: true,
      message: "Login successful",
      profile,
    });


  } catch (err) {
    next(err);
  }
};





export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const user = req.user;
    const accessToken = req.cookies?.accessToken;


    if (!user || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }


    const {
      currentPassword,
      newPassword,
    } = req.body;



    if (!currentPassword || !newPassword) {
      throw new AppError(
        400,
        "Current password and new password are required"
      );
    }



    const profile = await getProfileByIdFromDB(
      user.sub,
      user.orgId,
      accessToken
    );



    if (!profile?.email) {
      throw new AppError(
        404,
        "Profile email not found"
      );
    }



    await changePasswordFromAuth(
      {
        id: user.sub,
        email: profile.email,
        current_password: currentPassword,
        new_password: newPassword,
      },
      accessToken
    );



    res.status(204).send();


  } catch(err) {
    next(err);
  }

};





export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const meta = metaFromRequest(req);

    const refreshToken =
      req.cookies?.refreshToken;



    if (!refreshToken) {
      throw new AppError(
        401,
        "Refresh token missing"
      );
    }



    const tokens: TokenPair =
      await newRefresh(
        refreshToken,
        meta
      );



    setAuthCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken
    );



    res.status(204).send();


  } catch(err) {
    next(err);
  }

};





export const signOut = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const refreshToken =
      req.cookies?.refreshToken;



    if (refreshToken) {
      await signOutFromAuth(
        refreshToken
      );
    }



    res.clearCookie(
      "accessToken",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      }
    );



    res.clearCookie(
      "refreshToken",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/me/refresh",
      }
    );



    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });



  } catch(err) {
    next(err);
  }

};