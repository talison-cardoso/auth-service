import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../domain/errors/AppError";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  const message = getErrorMessage(err);
  return res.status(500).json({
    status: "error",
    message,
  });
}
