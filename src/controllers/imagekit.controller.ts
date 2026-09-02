import { Request, Response, NextFunction } from "express";
import { generateImageKitAuth } from "../services/imagekit.service";

export const getImageKitAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticationParameters = generateImageKitAuth();

    return res.status(200).json({
      success: true,
      message: "ImageKit authentication successful",
      data: authenticationParameters,
    });
  } catch (err) {
    next(err);
  }
};