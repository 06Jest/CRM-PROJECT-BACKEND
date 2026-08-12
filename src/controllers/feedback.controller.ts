import {
  Request,
  Response,
  NextFunction,
} from "express";

import { createFeedbackToDB } from "../services/feedback.service";

export const createFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const feedback = await createFeedbackToDB({
      name: req.body.name,
      email: req.body.email,
      userType: req.body.userType,
      rating: req.body.rating ?? null,
      message: req.body.message,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
};