import {
  NextFunction,
  Request,
  Response,
} from "express";

import { AuthService } from "../../modules/auth/auth.service";
import { UnauthorizedException } from "../exceptions/http.exception";

export interface ApiAuthRequest extends Request {
  apiClient?: {
    clientId: number;
    companyName: string;
    tokenId: string;
  };
}

const authService = new AuthService();

export const apiAuthMiddleware = async (
  req: ApiAuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      next(
        new UnauthorizedException(
          "Credenciales de acceso inválidas",
        ),
      );
      return;
    }

    const [scheme, token, ...extraParts] =
      authorization.trim().split(/\s+/);

    if (
      scheme?.toLowerCase() !== "bearer" ||
      !token ||
      extraParts.length > 0
    ) {
      next(
        new UnauthorizedException(
          "Credenciales de acceso inválidas",
        ),
      );
      return;
    }

    const authenticatedClient =
      await authService.authenticate(token);

    if (!authenticatedClient) {
      next(
        new UnauthorizedException(
          "Credenciales de acceso inválidas",
        ),
      );
      return;
    }

    req.apiClient = authenticatedClient;

    next();
  } catch (error) {
    next(error);
  }
};