export type ErrorCode =
  | "INVALID_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMIT_EXCEEDED"
  | "DATABASE_UNAVAILABLE";

export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestException extends HttpException {
  constructor(message = "Petición inválida") {
    super(400, "INVALID_REQUEST", message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Credenciales de acceso inválidas") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = "Acceso no permitido") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "El recurso solicitado no existe") {
    super(404, "NOT_FOUND", message);
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message = "Demasiadas peticiones") {
    super(429, "RATE_LIMIT_EXCEEDED", message);
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message = "Servicio temporalmente no disponible") {
    super(503, "DATABASE_UNAVAILABLE", message);
  }
}