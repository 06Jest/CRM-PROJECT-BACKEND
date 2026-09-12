import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  createMcpHandlerForContext,
} from "../server/mcp.server";

import {
  getMcpRequestContext,
} from "../context/mcp.context";

export async function handleMcpRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let mcpHandler:
    Awaited<ReturnType<typeof createMcpHandlerForContext>> | undefined;

  try {
    const context = getMcpRequestContext(req);

    mcpHandler = createMcpHandlerForContext(context);

    const request = new Request(
      `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: JSON.stringify(req.body),
      }
    );

    const response = await mcpHandler.fetch(request);

    res.status(response.status);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await response.text();

    res.send(body);
  } catch (error) {
    next(error);
  } finally {
    await mcpHandler?.close();
  }
}