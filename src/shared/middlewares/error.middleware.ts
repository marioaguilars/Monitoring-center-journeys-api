import {
  NextFunction,
  Request,
  Response,
} from "express";
import { HttpException } from "../exceptions/http.exception";
import { logger } from "../utils/logger";

interface BodyParserError extends SyntaxError {
  status?: number;
  type?: string;
}

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const requestId = res.locals.requestId;

  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
      requestId,
    });

    return;
  }

  const bodyParserError = err as BodyParserError;

  if (bodyParserError.status === 413) {
    res.status(413).json({
      success: false,
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "El cuerpo de la petición excede el tamaño permitido",
      },
      requestId,
    });

    return;
  }
  if (
    err instanceof SyntaxError &&
    bodyParserError.status === 400
  ) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "El cuerpo de la petición contiene JSON inválido",
      },
      requestId,
    });

    return;
  }

  logger.error(
    {
      err,
      requestId,
      method: req.method,
      path: req.path,
    },
    "[HTTP] Error no controlado",
  );

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Ocurrió un error interno en el servidor",
    },
    requestId,
  });
};