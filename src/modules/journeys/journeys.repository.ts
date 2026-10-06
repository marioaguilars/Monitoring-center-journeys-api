import { RowDataPacket } from "mysql2";
import { pool } from "../../config/db";
import {
  JourneyCursor,
  JourneyRecord,
} from "./journeys.types";

interface JourneyRow extends RowDataPacket {
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

  journeyHours: string | null;
  journeyStatus: JourneyRecord["journeyStatus"];

  positionType: string | null;
  countingReason: string | null;

  /**
   * MySQL representa TINYINT(1) como número.
   * Lo transformaremos antes de exponerlo.
   */
  isWorkday: number;

  createdAt: string;
}

export class JourneysRepository {
  /**
   * Recupera una página utilizando keyset pagination.
   *
   * No utilizamos OFFSET porque su coste crece conforme avanza
   * la paginación. La tabla ya posee un índice UNIQUE:
   *
   * (journey_date, eco)
   *
   * por lo que podemos continuar eficientemente desde el último
   * registro recibido.
   */
  async findPage(
    from: string,
    to: string,
    limit: number,
    cursor: JourneyCursor | null,
  ): Promise<JourneyRecord[]> {
    if (!cursor) {
      const [rows] = await pool.execute<JourneyRow[]>(
        `
          SELECT
            id,
            journey_date AS journeyDate,
            eco,
            registration,
            region,
            agency,
            departure_snapshot AS departureSnapshot,
            departure_coordinates AS departureCoordinates,
            departure_last_position AS departureLastPosition,
            arrival_snapshot AS arrivalSnapshot,
            arrival_coordinates AS arrivalCoordinates,
            arrival_last_position AS arrivalLastPosition,
            journey_hours AS journeyHours,
            journey_status AS journeyStatus,
            position_type AS positionType,
            counting_reason AS countingReason,
            is_workday AS isWorkday,
            created_at AS createdAt
          FROM tracking_daily_journeys
          WHERE journey_date >= ?
            AND journey_date <= ?
          ORDER BY journey_date ASC, eco ASC
          LIMIT ?
        `,
        [from, to, limit],
      );

      return this.mapRows(rows);
    }

    const [rows] = await pool.execute<JourneyRow[]>(
      `
        SELECT
          id,
          journey_date AS journeyDate,
          eco,
          registration,
          region,
          agency,
          departure_snapshot AS departureSnapshot,
          departure_coordinates AS departureCoordinates,
          departure_last_position AS departureLastPosition,
          arrival_snapshot AS arrivalSnapshot,
          arrival_coordinates AS arrivalCoordinates,
          arrival_last_position AS arrivalLastPosition,
          journey_hours AS journeyHours,
          journey_status AS journeyStatus,
          position_type AS positionType,
          counting_reason AS countingReason,
          is_workday AS isWorkday,
          created_at AS createdAt
        FROM tracking_daily_journeys
        WHERE journey_date >= ?
          AND journey_date <= ?
          AND (journey_date, eco) > (?, ?)
        ORDER BY journey_date ASC, eco ASC
        LIMIT ?
      `,
      [
        from,
        to,
        cursor.journeyDate,
        cursor.eco,
        limit,
      ],
    );

    return this.mapRows(rows);
  }

  private mapRows(
    rows: JourneyRow[],
  ): JourneyRecord[] {
    return rows.map((row) => ({
      id: row.id,
      journeyDate: row.journeyDate,
      eco: row.eco,
      registration: row.registration,
      region: row.region,
      agency: row.agency,

      departureSnapshot: row.departureSnapshot,
      departureCoordinates: row.departureCoordinates,
      departureLastPosition: row.departureLastPosition,

      arrivalSnapshot: row.arrivalSnapshot,
      arrivalCoordinates: row.arrivalCoordinates,
      arrivalLastPosition: row.arrivalLastPosition,

      journeyHours: row.journeyHours,
      journeyStatus: row.journeyStatus,

      positionType: row.positionType,
      countingReason: row.countingReason,
      isWorkday: row.isWorkday === 1,

      createdAt: row.createdAt,
    }));
  }
}