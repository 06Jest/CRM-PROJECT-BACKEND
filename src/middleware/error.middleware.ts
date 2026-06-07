import { Request, Response, NextFunction } from 'express';


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
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err) {
    return res.status(err.statusCode).json({
      success: false,
      error: `${err.message}`,
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