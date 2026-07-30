import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";

import {
  getUserConversationListItemsFromDB,
  findDirectConversationBetweenUsersFromDB,
  createNewConversationToDB,
  createDirectConversationToDB,
  getConversationsByIDsFromDB,
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

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;


    if (!orgId || !userId) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await getUserConversationListItemsFromDB(
        orgId,
        userId
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

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    const otherUserId =
      uuidSchema.parse(
        req.params.userId
      );


    if (!orgId || !userId) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await findDirectConversationBetweenUsersFromDB(
        orgId,
        userId,
        otherUserId
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

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    const { profile_id } = req.body;


    if (!orgId || !userId) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const existing =
      await findDirectConversationBetweenUsersFromDB(
        orgId,
        userId,
        profile_id
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
        profile_id
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


    if (!userId) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await getMessagesFromDB(
        conversationId,
        userId
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
    req.user?.orgId;


    if (!userId || !orgId) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }
    
    const chat = await getConversationByIDFromDB(orgId, conversationId)

    if(chat.type === 'announcement') {
      const profile = await getProfileByIdFromDB(userId, orgId);

      if (profile.role !== 'admin') {
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
        req.body
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


    if (!userId) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await editMessageFromDB(
        id,
        userId,
        req.body.content
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


    if (!userId) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await deleteMessageFromDB(
        id,
        userId
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


    if (!userId) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    await markConversationAsReadFromDB(
      conversationId,
      userId
    );


    return res.status(200).json({
      success:true,
      message:"Conversation marked as read",
    });


  } catch(err) {
    next(err);
  }

};