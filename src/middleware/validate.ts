import { Request, Response, NextFunction } from "express";
import { z } from "zod";



export const validate =
  <K extends "body" | "params" | "query">(target: K) =>
  (schema: z.ZodTypeAny<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req[target] = result.data;

    next();
  };

export const validateBody = validate("body");
export const validateParams = validate("params");
export const validateQuery = validate("query");