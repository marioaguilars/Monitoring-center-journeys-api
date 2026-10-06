import { Router } from "express";
import { JourneysController } from "./journeys.controller";
import { GetJourneysDto } from "./dtos/get-journeys.dto";
import { apiAuthMiddleware } from "../../shared/middlewares/api-auth.middleware";
import { clientRateLimiter } from "../../shared/middlewares/rate-limit.middleware";
import { validateDto } from "../../shared/middlewares/validation.middleware";

const router = Router();
const journeysController = new JourneysController();

/**
 * GET /api/v1/journeys
 *
 * Pipeline:
 * 1. autenticar empresa
 * 2. aplicar rate limit por cliente
 * 3. validar query params
 * 4. ejecutar caso de uso
 */
router.get(
  "/",
  apiAuthMiddleware,
  clientRateLimiter,
  validateDto(GetJourneysDto, "query"),
  journeysController.getJourneys,
);

export default router;