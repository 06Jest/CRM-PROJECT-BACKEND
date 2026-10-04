import {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../../middleware/error.middleware";
import { uuidSchema } from "../../schema/global.schema";

import {
  getUserConversationListItemsService,
  findDirectConversationService,
  createDirectConversationService,
  getConversationByIDService,
} from "./conversation.service";

import {
  getMessagesService,
  sendMessageService,
  editMessageService,
  deleteMessageService,
} from "./message.service";

import {
  markConversationAsReadService,
} from "./conversation.member.service";

export const getUserConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId =
      req.user?.member_id;
    const accessToken =
      req.cookies.accessToken;

    if (
      !orgId ||
      !memberId ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data =
      await getUserConversationListItemsService(
        orgId,
        memberId,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message:
        "Conversations fetch successful",
      data,
    });
  } catch (err) {
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
    const memberId =
      req.user?.member_id;
    const accessToken =
      req.cookies.accessToken;

    const otherUserId =
      uuidSchema.parse(
        req.params.memberId
      );

    if (
      !orgId ||
      !memberId ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data =
      await findDirectConversationService(
        orgId,
        memberId,
        otherUserId,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message:
        "Direct conversation fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const createDirectConversation =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orgId =
        req.user?.org_id;
      const memberId =
        req.user?.member_id;
      const accessToken =
        req.cookies.accessToken;

      if (
        !orgId ||
        !memberId ||
        !accessToken
      ) {
        throw new AppError(
          401,
          "Unauthorized user"
        );
      }

      const otherMemberId =
        uuidSchema.parse(
          req.params.memberId
        );

      const result =
        await createDirectConversationService(
          orgId,
          memberId,
          otherMemberId,
          accessToken
        );

      if (result.existing) {
        return res.status(200).json({
          success: true,
          message:
            "Direct conversation already exists",
          data: result.data,
        });
      }

      return res.status(201).json({
        success: true,
        message:
          "Direct conversation created",
        data: result.data,
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
      req.user?.member_id;

    const accessToken =
      req.cookies.accessToken;

    if (
      !memberId ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data =
      await getMessagesService(
        conversationId,
        memberId,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message:
        "Messages fetch successful",
      data,
    });
  } catch (err) {
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
      await getConversationByIDService(
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
      await sendMessageService(
        conversationId,
        memberId,
        req.body,
        accessToken
      );

    return res.status(201).json({
      success: true,
      message:
        "Message sent successfully",
      data,
    });
  } catch (err) {
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

    if (
      !memberId ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data =
      await editMessageService(
        id,
        memberId,
        req.body.content,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message:
        "Message updated successful",
      data,
    });
  } catch (err) {
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

    if (
      !memberId ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data =
      await deleteMessageService(
        id,
        memberId,
        accessToken
      );

    return res.status(200).json({
      success: true,
      message:
        "Message deleted successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const markConversationAsRead =
  async (
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

      if (
        !memberId ||
        !accessToken
      ) {
        throw new AppError(
          401,
          "Unauthorized user"
        );
      }

      const data =
        await markConversationAsReadService(
          conversationId,
          memberId,
          accessToken
        );

      return res.status(200).json({
        success: true,
        message:
          "Conversation marked as read",
        data,
      });
    } catch (err) {
      next(err);
    }
  };