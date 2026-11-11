import type { NextFunction, Request, Response } from "express";
import {
  BadRequestException,
  UnauthorizedException,
} from "../common/exceptions/error.exceptions.js";
import { TokenService } from "../common/service/token.service.js";

let tokenService = new TokenService();

export type RequestWithUser = Request & { user?: Record<string, any> };

export const auth = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  const [flag, token] = req.headers.authorization?.split(" ") || [];
  if (!token) {
    throw new BadRequestException("Token is required");
  }
  if (flag !== "Bearer") {
    throw new UnauthorizedException("Invalid authorization scheme");
  }

  const decodedData = tokenService.decodedAccessToken(token);
  if (!decodedData) {
    throw new BadRequestException("Invalid token");
  }
  req.user = decodedData as Record<string, any>;
  next();
};
