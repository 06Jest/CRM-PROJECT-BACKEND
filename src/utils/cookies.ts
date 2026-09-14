import { randomUUID } from "crypto";
import { Request, Response } from "express";

const isSecure = process.env.COOKIE_SECURE === "true";

const cookieOptions = {
  httpOnly: true,
  secure: isSecure,
  sameSite: isSecure ? ("none" as const) : ("lax" as const),
};

const AI_VISITOR_COOKIE_NAME = "ai_visitor_id";

export const getOrCreateAIVisitorId = (
  req: Request,
  res: Response
): string => {
  const existingVisitorId =
    req.cookies?.[AI_VISITOR_COOKIE_NAME];

  if (existingVisitorId) {
    return existingVisitorId;
  }

  const visitorId = randomUUID();

  res.cookie(AI_VISITOR_COOKIE_NAME, visitorId, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return visitorId;
};