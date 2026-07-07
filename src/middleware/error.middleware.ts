import { Request, Response, NextFunction } from 'express';
import { config } from "../config/environment";


export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  if (config.APP.nodeEnv === "development") {
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown Error",
    });
  }

  return res.status(500).json({ 
    success: false,
    error: 'Internal Server Error',
  });
};

export const notFound = (
  req: Request,
  res: Response
): void =>  {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
}