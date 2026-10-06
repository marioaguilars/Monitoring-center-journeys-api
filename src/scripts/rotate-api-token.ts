import { ResultSetHeader } from "mysql2";
import { pool, closeDatabaseConnection } from "../config/db";
import { envs } from "../config/envs";
import { logger } from "../shared/utils/logger";
import { generateApiToken } from "../shared/utils/token";

const calculateExpirationDate = (): Date => {
  const expiresAt = new Date();

  expiresAt.setUTCMonth(
    expiresAt.getUTCMonth() + envs.API_TOKEN_TTL_MONTHS,
  );

  return expiresAt;
};

const rotateApiToken = async (): Promise<void> => {
  const rawClientId = process.argv[2];
  const clientId = Number(rawClientId);

  if (!Number.isSafeInteger(clientId) || clientId <= 0) {
    throw new Error(
      "Debes indicar un clientId válido. Ejemplo: npm run token:rotate -- 1",
    );
  }

  const generatedToken = generateApiToken();
  const expiresAt = calculateExpirationDate();

  const [result] = await pool.execute<ResultSetHeader>(
    `
      INSERT INTO api_tokens (
        client_id,
        token_id,
        token_hash,
        expires_at
      )
      SELECT
        id,
        ?,
        ?,
        ?
      FROM api_clients
      WHERE id = ?
        AND is_active = 1
    `,
    [
      generatedToken.tokenId,
      generatedToken.tokenHash,
      expiresAt,
      clientId,
    ],
  );

  if (result.affectedRows !== 1) {
    throw new Error(
      "El cliente no existe o se encuentra deshabilitado",
    );
  }

  logger.info(
    {
      clientId,
      tokenId: generatedToken.tokenId,
      expiresAt: expiresAt.toISOString(),
    },
    "[API TOKEN] Nuevo token generado correctamente",
  );

  process.stdout.write(
    [
      "",
      "======================================================",
      " NUEVO API TOKEN — MOSTRAR / GUARDAR UNA SOLA VEZ",
      "======================================================",
      `Client ID: ${clientId}`,
      `Token ID:  ${generatedToken.tokenId}`,
      `Expira:    ${expiresAt.toISOString()}`,
      "",
      "TOKEN:",
      generatedToken.token,
      "",
      "IMPORTANTE:",
      "Los tokens anteriores siguen activos.",
      "Revoca el anterior únicamente después de actualizar al consumidor.",
      "======================================================",
      "",
    ].join("\n"),
  );
};

const main = async (): Promise<void> => {
  try {
    await rotateApiToken();
  } catch (error) {
    logger.error(
      { err: error },
      "[API TOKEN] No fue posible rotar el token",
    );

    process.exitCode = 1;
  } finally {
    await closeDatabaseConnection();
  }
};

void main();