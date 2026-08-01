import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";

import {
  getUserConversationListItemsFromDB,
  findDirectConversationBetweenUsersFromDB,
  createDirectConversationToDB,
  getConversationByIDFromDB,
} from "../services/chats/conversation.service";

import {
  getMessagesFromDB,
  sendMessageToDB,
  editMessageFromDB,
  deleteMessageFromDB,
} from "../services/chats/message.service";

import {
  markConversationAsReadFromDB,
} from "../services/chats/conversationMember.service";

import { getProfileByIdFromDB } from "../services/profiles.service";



export const getUserConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const orgId = req.user?.org_id;
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;


    if (!orgId || !userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await getUserConversationListItemsFromDB(
        orgId,
        userId,
        accessToken
      );


    return res.status(200).json({
      success: true,
      message: "Conversations fetch successful",
      data,
    });


  } catch(err) {
    next(err);
  }

};




export const getDirectConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const orgId = req.user?.org_id;
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;


    const otherUserId =
      uuidSchema.parse(
        req.params.userId
      );


    if (!orgId || !userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await findDirectConversationBetweenUsersFromDB(
        orgId,
        userId,
        otherUserId,
        accessToken
      );


    return res.status(200).json({
      success:true,
      message:"Direct conversation fetch successful",
      data,
    });


  } catch(err) {
    next(err);
  }

};




export const createDirectConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const orgId = req.user?.org_id;
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;


    const { profile_id } = req.body;


    if (!orgId || !userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const existing =
      await findDirectConversationBetweenUsersFromDB(
        orgId,
        userId,
        profile_id,
        accessToken
      );


    if (existing) {

      return res.status(200).json({
        success:true,
        message:"Direct conversation already exists",
        data: existing,
      });

    }


    const data =
      await createDirectConversationToDB(
        orgId,
        userId,
        profile_id,
        accessToken
      );


    return res.status(201).json({
      success:true,
      message:"Direct conversation created",
      data,
    });


  } catch(err) {
    next(err);
  }

};




export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const conversationId =
      uuidSchema.parse(
        req.params.conversationId
      );

    const userId =
      req.user?.sub;

    const accessToken =
      req.cookies.accessToken;


    if (!userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await getMessagesFromDB(
        conversationId,
        userId,
        accessToken
      );


    return res.status(200).json({
      success:true,
      message:"Messages fetch successful",
      data,
    });


  } catch(err) {
    next(err);
  }

};




export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const conversationId =
      uuidSchema.parse(
        req.params.conversationId
      );

    const userId =
      req.user?.sub;

    const orgId =
      req.user?.org_id;

    const accessToken =
      req.cookies.accessToken;


    if (!userId || !orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const chat =
      await getConversationByIDFromDB(
        orgId,
        conversationId,
        accessToken
      );


    if(chat.type === "announcement") {

      const profile =
        await getProfileByIdFromDB(
          userId,
          orgId,
          accessToken
        );


      if(profile.role !== "admin") {
        throw new AppError(
          401,
          "Only Admin can send Messages to Announcements"
        );
      }
    }


    const data =
      await sendMessageToDB(
        conversationId,
        userId,
        req.body,
        accessToken
      );


    return res.status(201).json({
      success:true,
      message:"Message sent successful",
      data,
    });


  } catch(err) {
    next(err);
  }

};




export const editMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const id =
      uuidSchema.parse(
        req.params.id
      );

    const userId =
      req.user?.sub;

    const accessToken =
      req.cookies.accessToken;


    if (!userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await editMessageFromDB(
        id,
        userId,
        req.body.content,
        accessToken
      );


    return res.status(200).json({
      success:true,
      message:"Message updated successful",
      data,
    });


  } catch(err) {
    next(err);
  }

};




export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const id =
      uuidSchema.parse(
        req.params.id
      );

    const userId =
      req.user?.sub;

    const accessToken =
      req.cookies.accessToken;


    if (!userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await deleteMessageFromDB(
        id,
        userId,
        accessToken
      );


    return res.status(200).json({
      success:true,
      message:"Message deleted successful",
      data,
    });


  } catch(err) {
    next(err);
  }

};




export const markConversationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const conversationId =
      uuidSchema.parse(
        req.params.conversationId
      );

    const userId =
      req.user?.sub;

    const accessToken =
      req.cookies.accessToken;


    if (!userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    await markConversationAsReadFromDB(
      conversationId,
      userId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Conversation marked as read",
    });


  } catch(err) {
    next(err);
  }

};