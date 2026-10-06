import mysql from "mysql2/promise";
import { envs } from "./envs";
import { logger } from "../shared/utils/logger";

export const pool = mysql.createPool({
  host: envs.DB_HOST,
  port: envs.DB_PORT,
  user: envs.DB_USER,
  password: envs.DB_PASSWORD,
  database: envs.DB_NAME,

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 50,

  connectTimeout: 10_000,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  timezone: "+00:00",
  dateStrings: true,
});

export const checkDatabaseConnection = async (): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    await connection.query("SELECT 1");

    logger.info(
      {
        host: envs.DB_HOST,
        database: envs.DB_NAME,
      },
      "[DATABASE] Conexión establecida correctamente",
    );
  } finally {
    connection.release();
  }
};

export const closeDatabaseConnection = async (): Promise<void> => {
  await pool.end();

  logger.info("[DATABASE] Pool de conexiones cerrado");
};