import {
  NextFunction,
  Request,
  Response,
} from "express";
import { NotFoundException } from "../exceptions/http.exception";

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next(
    new NotFoundException(
      "El recurso solicitado no existe",
    ),
  );
};