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

const createApiClient = async (): Promise<void> => {
  const companyName = process.argv.slice(2).join(" ").trim();

  if (!companyName) {
    throw new Error(
      'Debes indicar el nombre de la empresa. Ejemplo: npm run token:create -- "Empresa Demo"',
    );
  }

  if (companyName.length > 150) {
    throw new Error(
      "El nombre de la empresa no puede superar 150 caracteres",
    );
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [clientResult] = await connection.execute<ResultSetHeader>(
      `
        INSERT INTO api_clients (
          company_name
        )
        VALUES (?)
      `,
      [companyName],
    );

    const clientId = clientResult.insertId;

    const generatedToken = generateApiToken();
    const expiresAt = calculateExpirationDate();

    await connection.execute<ResultSetHeader>(
      `
        INSERT INTO api_tokens (
          client_id,
          token_id,
          token_hash,
          expires_at
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        clientId,
        generatedToken.tokenId,
        generatedToken.tokenHash,
        expiresAt,
      ],
    );

    await connection.commit();

    logger.info(
      {
        clientId,
        companyName,
        tokenId: generatedToken.tokenId,
        expiresAt: expiresAt.toISOString(),
      },
      "[API CLIENT] Cliente y token creados correctamente",
    );

    process.stdout.write(
      [
        "",
        "======================================================",
        " API TOKEN GENERADO — MOSTRAR / GUARDAR UNA SOLA VEZ",
        "======================================================",
        `Empresa:    ${companyName}`,
        `Client ID:  ${clientId}`,
        `Token ID:   ${generatedToken.tokenId}`,
        `Expira:     ${expiresAt.toISOString()}`,
        "",
        `TOKEN:`,
        generatedToken.token,
        "",
        "======================================================",
        "",
      ].join("\n"),
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const main = async (): Promise<void> => {
  try {
    await createApiClient();
  } catch (error) {
    logger.error(
      { err: error },
      "[API CLIENT] No fue posible crear el cliente",
    );

    process.exitCode = 1;
  } finally {
    await closeDatabaseConnection();
  }
};

void main();