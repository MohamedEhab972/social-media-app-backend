import type { Response } from "express";

interface ISuccessResponse<T> {
  message: string;
  data?: T | undefined;
}

export const successResponse = <T>(
  res: Response<ISuccessResponse<T>>,
  message = "Success",
  statusCode = 200,
  data?: T | undefined,
): Response<ISuccessResponse<T>> => {
  return res.status(statusCode).json({
    message,
    data,
  });
};
