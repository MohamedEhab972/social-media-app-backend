import type { NextFunction, Request, Response } from "express";
import type { Error } from "mongoose";
import { env } from "../config/env.service.js";

export const errorHandlingMiddleware = (
  err: any | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isDev = env.MODE !== "production";
  return res.status(err.statusCode || 500).json({
    message: err.message,
    ...(isDev ? { stack: err.stack, cause: err.cause } : {}),
  });
};
