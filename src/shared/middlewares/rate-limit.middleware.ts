import rateLimit from "express-rate-limit";
import { envs } from "../../config/envs";
import { TooManyRequestsException } from "../exceptions/http.exception";
import { ApiAuthRequest } from "./api-auth.middleware";

/**
 * Protección preliminar por IP.
 *
 * Se ejecuta antes de autenticación para limitar intentos abusivos,
 * incluyendo tokens inexistentes o malformados.
 */
export const ipRateLimiter = rateLimit({
  windowMs: envs.RATE_LIMIT_WINDOW_MS,
  limit: envs.IP_RATE_LIMIT_MAX,

  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res, next) => {
    next(
      new TooManyRequestsException(
        "Demasiadas peticiones desde esta dirección IP",
      ),
    );
  },
});

/**
 * Rate limit por consumidor autenticado.
 *
 * IMPORTANTE:
 * Debe ejecutarse después de apiAuthMiddleware,
 * ya que utiliza req.apiClient.clientId como identificador.
 */
export const clientRateLimiter = rateLimit({
  windowMs: envs.RATE_LIMIT_WINDOW_MS,
  limit: envs.CLIENT_RATE_LIMIT_MAX,

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    const authRequest = req as ApiAuthRequest;

    return String(authRequest.apiClient?.clientId ?? "unknown-client");
  },

  handler: (req, res, next) => {
    next(
      new TooManyRequestsException(
        "Límite de peticiones excedido",
      ),
    );
  },
});