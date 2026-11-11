import type { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../exceptions/error.exceptions.js";
import type { ZodType } from "zod";

type validationKey = keyof Request;
type validationSchema = Partial<Record<validationKey, ZodType>>;

export const validation = (schema: validationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let validationErrors = [];
    for (const key of Object.keys(schema) as Array<validationKey>) {
      if (!schema[key]) {
        throw new BadRequestException(
          `Missing required field: ${key as string}`,
        );
      }
      const result = schema[key].safeParse(req[key]);
      if (!result.success) {
        validationErrors.push({
          field: key,
          errors: result.error.issues,
        });
      } else if (key === "body") {
        // keep the parsed/transformed data (e.g. gender -> GenderEnum)
        req.body = result.data;
      }
    }
    if (validationErrors.length > 0) {
      throw new BadRequestException("Validation failed", validationErrors);
    }
    next();
  };
};
