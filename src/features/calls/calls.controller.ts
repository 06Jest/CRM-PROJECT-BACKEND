import {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../../middleware/error.middleware";
import { uuidSchema } from "../../schema/global.schema";

import {
  getCallsService,
  getCallByIDService,
  getLeadCallsService,
  getContactCallsService,
  addCallService,
  updateCallService,
  startCallService,
  endCallService,
  cancelCallService,
  archiveCallService,
  deleteCallService,
} from "./calls.service";

export const getCalls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await getCallsService(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Calls fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getCallByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(
      req.params.id
    );

    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await getCallByIDService(
      id,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Call fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getLeadCalls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const leadId = uuidSchema.parse(
      req.params.leadId
    );

    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await getLeadCallsService(
      orgId,
      leadId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Lead Calls fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getContactCalls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactId = uuidSchema.parse(
      req.params.contactId
    );

    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await getContactCallsService(
      orgId,
      contactId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Contact Calls fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const addCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await addCallService(
      orgId,
      memberId,
      req.body,
      accessToken
    );

    return res.status(201).json({
      success: true,
      message: "Add Call successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(
      req.params.id
    );

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await updateCallService(
      id,
      orgId,
      memberId,
      req.body,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Update Call successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const startCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(
      req.params.id
    );

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await startCallService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Call started successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const endCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(
      req.params.id
    );

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await endCallService(
      id,
      orgId,
      memberId,
      req.body,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Call completed successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(
      req.params.id
    );

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await cancelCallService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Call cancelled successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const archiveCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(
      req.params.id
    );

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await archiveCallService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Archive Call successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(
      req.params.id
    );

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await deleteCallService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Delete Call successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};