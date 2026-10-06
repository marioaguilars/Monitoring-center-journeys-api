/**
 * Estados válidos definidos actualmente por el ENUM de MySQL.
 */
export type JourneyStatus =
  | "CONTABILIZADA"
  | "NO_CONTABILIZADA";

/**
 * Contrato público de un journey.
 *
 * Se utilizan nombres camelCase para desacoplar el contrato HTTP
 * de los nombres físicos de las columnas MySQL.
 */
export interface JourneyRecord {
  id: number;
  journeyDate: string;
  eco: string;
  registration: string | null;
  region: string | null;
  agency: string | null;

  departureSnapshot: string | null;
  departureCoordinates: string | null;
  departureLastPosition: string | null;

  arrivalSnapshot: string | null;
  arrivalCoordinates: string | null;
  arrivalLastPosition: string | null;

  /**
   * mysql2 retorna DECIMAL como string por defecto.
   * Mantenerlo como string evita pérdidas de precisión.
   */
  journeyHours: string | null;
  journeyStatus: JourneyStatus;

  /**
   * Clasificación de la posición utilizada para determinar
   * el estado o contabilización del journey.
   */
  positionType: string | null;

  /**
   * Motivo funcional por el cual el journey fue contabilizado
   * o descartado.
   */
  countingReason: string | null;

  /**
   * Indicador normalizado a boolean para no exponer al consumidor
   * el detalle físico TINYINT(1) de MySQL.
   */
  isWorkday: boolean;
  createdAt: string;
}

/**
 * Posición lógica utilizada por keyset pagination.
 *
 * La combinación journeyDate + eco ya es UNIQUE en MySQL,
 * por lo tanto constituye un cursor estable.
 */
export interface JourneyCursor {
  journeyDate: string;
  eco: string;
}

export interface JourneyQuery {
  from: string;
  to: string;
  limit: number;
  cursor: JourneyCursor | null;
}

export interface JourneyPagination {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface JourneyPage {
  data: JourneyRecord[];
  pagination: JourneyPagination;
}