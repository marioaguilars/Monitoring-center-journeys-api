import { randomUUID } from "node:crypto";
import {
  NextFunction,
  Request,
  Response,
} from "express";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const requestId = randomUUID();

  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
};