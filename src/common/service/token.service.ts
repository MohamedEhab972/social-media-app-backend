import { env } from "../../config/env.service.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { RoleEnum } from "../enums/user.enums.js";
import { UnauthorizedException } from "../exceptions/error.exceptions.js";

export class TokenService {
  constructor() {}

  generateToken(payload: Record<string, any>) {
    let signature = undefined;
    let audience = undefined;
    let refresherSignature = undefined;
    switch (payload.role) {
      case RoleEnum.Admin:
        signature = env.ADMIN_JWT_SECRET;
        refresherSignature = env.ADMIN_REFRESH_SECRET;
        audience = "Admin";
        break;

      default:
        signature = env.USER_JWT_SECRET;
        refresherSignature = env.USER_REFRESH_SECRET;
        audience = "User";
        break;
    }

    const accessToken = jwt.sign(payload, signature as string, {
      expiresIn: env.JWT_EXPIRES_IN as NonNullable<
        jwt.SignOptions["expiresIn"]
      >,
      audience,
    });

    const refreshToken = jwt.sign(payload, refresherSignature as string, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as NonNullable<
        jwt.SignOptions["expiresIn"]
      >,
      audience,
    });
    return { accessToken, refreshToken };
  }

  decodedAccessToken(token: string) {
    try {
      let decoded = jwt.decode(token, { complete: true }) as JwtPayload;
      if (!decoded) {
        throw new UnauthorizedException("Invalid token");
      }

      let signature = undefined;
      switch (decoded.payload.role) {
        case RoleEnum.Admin:
          signature = env.ADMIN_JWT_SECRET;
          break;
        default:
          signature = env.USER_JWT_SECRET;
          break;
      }
      let decodedToken = jwt.verify(token, signature as string);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException("Invalid token", error);
    }
  }

  decodedRefreshToken(token: string) {
    try {
      let decoded = jwt.decode(token, { complete: true }) as JwtPayload;
      if (!decoded) {
        throw new UnauthorizedException("Invalid token");
      }

      let signature = undefined;
      switch (decoded.payload.role) {
        case RoleEnum.Admin:
          signature = env.ADMIN_REFRESH_SECRET;
          break;
        default:
          signature = env.USER_REFRESH_SECRET;
          break;
      }
      let decodedToken = jwt.verify(token, signature as string);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException("Invalid token", error);
    }
  }
}
