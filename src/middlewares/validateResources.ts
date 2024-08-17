import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import { errorResponse } from "../utils/responses.utils";
import { HTTP_MESSAGES, HTTP_STATUS } from "../libs";

export const validateFormData =
  (schema: AnyZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.safeParse({
          body: req.body,
          params: req.params,
          query: req.query,
          file: req.file
        });
        next();
      } catch (error: any) {
        return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
          message: error.errors[0].message,
        });
      }
    };

export const validateJson =
  (schema: AnyZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse({
          file: req.file,
          body: req.body,
          params: req.params,
          query: req.query,
        });
        next();
      } catch (error: any) {
        return errorResponse(res, HTTP_STATUS.BAD_REQUEST, HTTP_MESSAGES.BAD_REQUEST, {
          message: error.errors[0].message,
        });
      }
    };
