import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import idempotencyService from "./idempotency.service";

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const idempotencyKey = req.header("Idempotency-Key");

    if (!idempotencyKey) {
      throw new AppError(
        400,
        "Idempotency-Key header is required"
      );
    }

    const orgId = req.user?.org_id;
    const memberId = req.user?.sub;

    if (!orgId || !memberId) {
      throw new AppError(401, "Unauthorized");
    }

    const existing = await idempotencyService.get<{
      status: "processing" | "completed";
      statusCode?: number;
      response?: unknown;
    }>(
      orgId,
      memberId,
      idempotencyKey
    );

    if (existing?.status === "completed") {
      return res
        .status(existing.statusCode ?? 200)
        .json(existing.response);
    }

    if (existing?.status === "processing") {
      throw new AppError(
        409,
        "Request with this Idempotency-Key is already being processed."
      );
    }

    const acquired = await idempotencyService.acquire(
      orgId,
      memberId,
      idempotencyKey
    );

    if (!acquired) {
      throw new AppError(
        409,
        "Request with this Idempotency-Key is already being processed."
      );
    }

    res.locals.idempotencyKey = idempotencyKey;

    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
      void idempotencyService.set(
        orgId,
        memberId,
        idempotencyKey,
        {
          status: "completed",
          statusCode: res.statusCode,
          response: body,
        },
        24 * 60 * 60
      );

      return originalJson(body);
    };

    res.on("finish", async () => {
      if (res.statusCode >= 400) {
        await idempotencyService.delete(
          orgId,
          memberId,
          idempotencyKey
        );
      }
    });

    next();
  } catch (err) {
    next(err);
  }
};