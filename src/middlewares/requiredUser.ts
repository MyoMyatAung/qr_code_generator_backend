import { NextFunction, Request, Response } from "express";

export function requiredUser(req: Request, res: Response, next: NextFunction) {
  if (!res.locals.user) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
}