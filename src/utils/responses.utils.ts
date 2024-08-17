import { Response } from "express";

export const successResponse = <T>(
  res: Response,
  status: number,
  message: string,
  meta: any,
  data: T
) => {
  return res.status(status).json({
    statusCode: status,
    message: message,
    data,
    meta,
  });
};

export const errorResponse = (
  res: Response,
  status: number,
  message: string,
  error: any
) => {
  return res.status(status).json({
    statusCode: status,
    message: message,
    error,
  });
};
