import {
  NextFunction,
  Request,
  Response,
} from "express";
import { GetJourneysDto } from "./dtos/get-journeys.dto";
import { JourneysService } from "./journeys.service";

export class JourneysController {
  constructor(
    private readonly journeysService =
      new JourneysService(),
  ) {}

  /**
   * El controller únicamente traduce HTTP → Service → HTTP.
   *
   * No contiene SQL ni reglas de negocio.
   */
  getJourneys = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = res.locals.validatedQuery as GetJourneysDto;
      if (!dto) {
        throw new Error(
            "GetJourneysDto no fue inyectado por el middleware de validación",
        );
      }

      const result = await this.journeysService.getJourneys(dto);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        requestId: res.locals.requestId,
      });
    } catch (error) {
      next(error);
    }
  };
}