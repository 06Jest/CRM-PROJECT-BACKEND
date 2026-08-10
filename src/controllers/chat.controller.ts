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
import { getMemberIDbyProfileID } from "../services/organization.members.service";
import { supabaseAdmin } from "../config/supabase";



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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const otherMemberId = uuidSchema.parse(req.params.memberId);

    if (otherMemberId === memberId) {
      throw new AppError(400, "You can't start a direct conversation with yourself.");
    }


    const { data: targetMember, error: lookupError } = await supabaseAdmin
      .from("organization_members")
      .select(`
        id,
        profile:profiles!organization_members_profile_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq("id", otherMemberId)
      .eq("org_id", orgId)
      .eq("status", "active")
      .maybeSingle();

    if (lookupError) {
      throw new AppError(500, `Failed to verify member: ${lookupError.message}`);
    }
    if (!targetMember) {
      throw new AppError(400, "Selected user is not an active member of your organization.");
    }

    const otherProfile = Array.isArray(targetMember.profile)
      ? targetMember.profile[0]
      : targetMember.profile;

    const existing = await findDirectConversationBetweenUsersFromDB(
      orgId,
      memberId,
      otherMemberId,
      accessToken
    );

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Direct conversation already exists",
        data: existing,
      });
    }

    const conversation = await createDirectConversationToDB(
      orgId,
      memberId,
      otherMemberId,
      accessToken
    );


    const data = {
      ...conversation,
      other_participant: {
        id: targetMember.id,
        profile: {
          id: otherProfile.id,
          first_name: otherProfile.first_name,
          last_name: otherProfile.last_name,
          avatar_url: otherProfile.avatar_url ?? null,
        },
      },
      last_read_at: null,
    };

    return res.status(201).json({
      success: true,
      message: "Direct conversation created",
      data,
    });
  } catch (err) {
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

    console.log("MARK AS READ:", {
      conversationId,
      memberId,
      profileId: req.user?.sub,
    });


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