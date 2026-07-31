import { Request, Response, NextFunction } from "express";

import { AppError } from "../middleware/error.middleware";

import { uuidSchema } from "../schema/global.schema";

import {
  getCallsFromDB,
  getCallByIDFromDB,
  getLeadCallsFromDB,
  getContactCallsFromDB,
  addCallToDB,
  updateCallFromDB,
  startCallFromDB,
  endCallFromDB,
  cancelCallFromDB,
  deleteCallFromDB,
} from "../services/calls.service";

export const getCalls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getCallsFromDB(orgId);

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

    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getCallByIDFromDB(
      id,
      orgId
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

    const leadId = uuidSchema.parse(req.params.leadId);

    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getLeadCallsFromDB(
      orgId,
      leadId
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

    const contactId = uuidSchema.parse(req.params.contactId);

    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getContactCallsFromDB(
      orgId,
      contactId
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

    const orgId = req.user?.orgId;

    const userId = req.user?.sub;

    const call = req.body;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await addCallToDB(
      orgId,
      userId,
      call
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

    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.orgId;

    const call = req.body;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getCallByIDFromDB(
      id,
      orgId
    );

    if (
      check.status === "completed"
    ) {
      throw new AppError(
        400,
        "Completed calls cannot be updated"
      );
    }

    if (
      check.status === "cancelled"
    ) {
      throw new AppError(
        400,
        "Cancelled calls cannot be updated"
      );
    }

    const data = await updateCallFromDB(
      id,
      orgId,
      call
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

    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getCallByIDFromDB(
      id,
      orgId
    );

    if (check.status === "active") {
      throw new AppError(
        400,
        "Call is already active"
      );
    }

    if (check.status === "completed") {
      throw new AppError(
        400,
        "Completed calls cannot be started"
      );
    }

    if (check.status === "cancelled") {
      throw new AppError(
        400,
        "Cancelled calls cannot be started"
      );
    }

    const data = await startCallFromDB(
      id,
      orgId
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

    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.orgId;

    const callData = req.body;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user");
    }


    const check = await getCallByIDFromDB(
      id,
      orgId
    );


    if (check.status !== "active") {
      throw new AppError(
        400,
        "Only active calls can be completed"
      );
    }


    const data = await endCallFromDB(
      id,
      orgId,
      callData
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

    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.orgId;


    if (!orgId) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const check = await getCallByIDFromDB(
      id,
      orgId
    );


    if (check.status === "completed") {
      throw new AppError(
        400,
        "Completed calls cannot be cancelled"
      );
    }


    if (check.status === "cancelled") {
      throw new AppError(
        400,
        "Call is already cancelled"
      );
    }


    const data = await cancelCallFromDB(
      id,
      orgId
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

export const deleteCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.orgId;


    if (!orgId) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await deleteCallFromDB(
      id,
      orgId
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

