import { JourneyCursor } from "../../modules/journeys/journeys.types";

interface CursorPayload {
  v: 1;
  journeyDate: string;
  eco: string;
}

/**
 * Comprueba que una fecha sea realmente válida y no solamente
 * que tenga apariencia YYYY-MM-DD.
 *
 * Ejemplo rechazado:
 * 2026-02-31
 */
export const isValidIsoDate = (
  value: string,
): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === value;
};

/**
 * El cursor es opaco para el cliente, pero no contiene secretos.
 *
 * Base64URL evita caracteres problemáticos dentro de URLs.
 */
export const encodeJourneyCursor = (
  cursor: JourneyCursor,
): string => {
  const payload: CursorPayload = {
    v: 1,
    journeyDate: cursor.journeyDate,
    eco: cursor.eco,
  };

  return Buffer.from(
    JSON.stringify(payload),
    "utf8",
  ).toString("base64url");
};

/**
 * Decodifica y valida defensivamente un cursor recibido.
 *
 * Nunca confiamos directamente en contenido proveniente del cliente,
 * aunque haya sido generado originalmente por nuestra propia API.
 */
export const decodeJourneyCursor = (
  cursor: string,
): JourneyCursor | null => {
  try {
    const decoded = Buffer.from(
      cursor,
      "base64url",
    ).toString("utf8");

    const payload = JSON.parse(
      decoded,
    ) as Partial<CursorPayload>;

    if (
      payload.v !== 1 ||
      typeof payload.journeyDate !== "string" ||
      typeof payload.eco !== "string"
    ) {
      return null;
    }

    if (!isValidIsoDate(payload.journeyDate)) {
      return null;
    }

    if (
      payload.eco.length === 0 ||
      payload.eco.length > 50
    ) {
      return null;
    }

    return {
      journeyDate: payload.journeyDate,
      eco: payload.eco,
    };
  } catch {
    return null;
  }
};