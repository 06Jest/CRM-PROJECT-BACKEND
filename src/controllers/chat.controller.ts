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
} from "../services/chats/conversation.member.service";



export const getUserConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;


    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await getUserConversationListItemsFromDB(
        orgId,
        memberId,
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
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;


    const otherUserId =
      uuidSchema.parse(
        req.params.memberId
      );


    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await findDirectConversationBetweenUsersFromDB(
        orgId,
        memberId,
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
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;

    const { member_id } = req.body;


    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const existing =
      await findDirectConversationBetweenUsersFromDB(
        orgId,
        memberId,
        member_id,
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
        memberId,
        member_id,
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

    const memberId =
      req.user?.member_id ;

    const accessToken =
      req.cookies.accessToken;


    if (!memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await getMessagesFromDB(
        conversationId,
        memberId,
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


    const memberId =
      req.user?.member_id;


    const orgId =
      req.user?.org_id;


    const role =
      req.user?.user_metadata?.role;


    const accessToken =
      req.cookies.accessToken;



    if (
      !memberId ||
      !orgId ||
      !accessToken
    ) {
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



    if (
      chat.type === "announcement" &&
      role !== "owner" &&
      role !== "manager"
    ) {

      throw new AppError(
        403,
        "Only managers and owners can send messages to announcements"
      );

    }



    const data =
      await sendMessageToDB(
        conversationId,
        memberId,
        req.body,
        accessToken
      );



    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
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

    const memberId =
      req.user?.member_id;

    const accessToken =
      req.cookies.accessToken;


    if (!memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await editMessageFromDB(
        id,
        memberId,
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

    const memberId =
      req.user?.member_id;

    const accessToken =
      req.cookies.accessToken;


    if (!memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data =
      await deleteMessageFromDB(
        id,
        memberId,
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

    const memberId =
      req.user?.member_id;

    const accessToken =
      req.cookies.accessToken;


    if (!memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    await markConversationAsReadFromDB(
      conversationId,
      memberId,
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