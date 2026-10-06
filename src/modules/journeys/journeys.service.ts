import { BadRequestException } from "../../shared/exceptions/http.exception";
import {
  decodeJourneyCursor,
  encodeJourneyCursor,
  isValidIsoDate,
} from "../../shared/utils/cursor";
import { GetJourneysDto } from "./dtos/get-journeys.dto";
import { JourneysRepository } from "./journeys.repository";
import { JourneyPage } from "./journeys.types";

const MILLISECONDS_PER_DAY = 86_400_000;
const MAX_DATE_RANGE_DAYS = 31;

export class JourneysService {
  constructor(
    private readonly journeysRepository =
      new JourneysRepository(),
  ) {}

  async getJourneys(
    dto: GetJourneysDto,
  ): Promise<JourneyPage> {
    this.validateDateRange(dto.from, dto.to);

    const cursor = dto.cursor
      ? decodeJourneyCursor(dto.cursor)
      : null;

    if (dto.cursor && !cursor) {
      throw new BadRequestException(
        "El cursor proporcionado no es válido",
      );
    }

    /**
     * Un cursor pertenece al rango con el que fue utilizado.
     * Rechazar cursores fuera del rango evita resultados confusos
     * si un consumidor reutiliza accidentalmente un cursor anterior.
     */
    if (
      cursor &&
      (
        cursor.journeyDate < dto.from ||
        cursor.journeyDate > dto.to
      )
    ) {
      throw new BadRequestException(
        "El cursor no pertenece al rango solicitado",
      );
    }

    /**
     * Solicitamos un elemento adicional.
     *
     * Si limit=500 pedimos 501:
     * - <=500 → no existe otra página
     * - 501    → existe otra página
     *
     * Así evitamos un COUNT(*) adicional.
     */
    const rows =
      await this.journeysRepository.findPage(
        dto.from,
        dto.to,
        dto.limit + 1,
        cursor,
      );

    const hasMore = rows.length > dto.limit;

    const data = hasMore
      ? rows.slice(0, dto.limit)
      : rows;

    const lastRecord =
      data.length > 0
        ? data[data.length - 1]
        : undefined;

    const nextCursor =
      hasMore && lastRecord
        ? encodeJourneyCursor({
            journeyDate: lastRecord.journeyDate,
            eco: lastRecord.eco,
          })
        : null;

    return {
      data,
      pagination: {
        limit: dto.limit,
        hasMore,
        nextCursor,
      },
    };
  }

  /**
   * Valida reglas semánticas del rango.
   *
   * Estas reglas pertenecen al dominio y no al DTO porque relacionan
   * múltiples propiedades de la petición.
   */
  private validateDateRange(
    from: string,
    to: string,
  ): void {
    if (
      !isValidIsoDate(from) ||
      !isValidIsoDate(to)
    ) {
      throw new BadRequestException(
        "from y to deben representar fechas válidas",
      );
    }

    const fromDate = new Date(
      `${from}T00:00:00.000Z`,
    );

    const toDate = new Date(
      `${to}T00:00:00.000Z`,
    );

    if (fromDate > toDate) {
      throw new BadRequestException(
        "from no puede ser posterior a to",
      );
    }

    const rangeDays =
      Math.floor(
        (toDate.getTime() - fromDate.getTime()) /
          MILLISECONDS_PER_DAY,
      ) + 1;

    if (rangeDays > MAX_DATE_RANGE_DAYS) {
      throw new BadRequestException(
        `El rango máximo permitido es de ${MAX_DATE_RANGE_DAYS} días`,
      );
    }
  }
}