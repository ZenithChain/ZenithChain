import type { Request, Response, NextFunction } from "express";
import { HttpError } from "./userService";

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      code: err.code,
      retryAfterSeconds: err.retryAfterSeconds,
    });
    return;
  }
  req.log.error({ err }, "Unhandled route error");
  res.status(500).json({ error: "Internal server error" });
}
