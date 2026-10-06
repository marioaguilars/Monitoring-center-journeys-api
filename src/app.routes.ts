import { Router } from "express";
import {
  ApiAuthRequest,
  apiAuthMiddleware,
} from "./shared/middlewares/api-auth.middleware";
import { clientRateLimiter } from "./shared/middlewares/rate-limit.middleware";
import journeysRoutes from "./modules/journeys/journeys.routes";

const router = Router();

/**
 * Todas las APIs públicas se versionan desde este router maestro.
 *
 * Esto nos permitirá incorporar /v2 en el futuro sin romper
 * consumidores existentes.
 */
router.use("/v1/journeys", journeysRoutes);

// router.get(
//   "/auth-check",
//   apiAuthMiddleware,
//   clientRateLimiter,
//   (req: ApiAuthRequest, res) => {
//     res.status(200).json({
//       success: true,
//       client: {
//         clientId: req.apiClient?.clientId,
//         companyName: req.apiClient?.companyName,
//       },
//       requestId: res.locals.requestId,
//     });
//   },
// );

export default router;