import { ResultSetHeader } from "mysql2";
import { pool, closeDatabaseConnection } from "../config/db";
import { logger } from "../shared/utils/logger";

const revokeApiToken = async (): Promise<void> => {
  const tokenId = process.argv[2]?.trim();

  if (!tokenId || !/^[a-f0-9]{32}$/.test(tokenId)) {
    throw new Error(
      "Debes indicar un tokenId válido de 32 caracteres hexadecimales",
    );
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE api_tokens
      SET revoked_at = UTC_TIMESTAMP()
      WHERE token_id = ?
        AND revoked_at IS NULL
    `,
    [tokenId],
  );

  if (result.affectedRows !== 1) {
    throw new Error(
      "El token no existe o ya se encuentra revocado",
    );
  }

  logger.info(
    {
      tokenId,
    },
    "[API TOKEN] Token revocado correctamente",
  );
};

const main = async (): Promise<void> => {
  try {
    await revokeApiToken();
  } catch (error) {
    logger.error(
      { err: error },
      "[API TOKEN] No fue posible revocar el token",
    );

    process.exitCode = 1;
  } finally {
    await closeDatabaseConnection();
  }
};

void main();