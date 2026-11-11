import type { NextFunction, Response } from "express";
import type { RequestWithUser } from "./auth.middleware.js";
import { UnauthorizedException } from "../common/exceptions/error.exceptions.js";
import type { RoleEnum } from "../common/indexs.js";

export const checkRole = (roles: RoleEnum[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      throw new UnauthorizedException(
        "You do not have permission to access this resource",
      );
    }
    next();
  };
};
