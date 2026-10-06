import "reflect-metadata";
import app from "./app";
import { envs } from "./config/envs";
import { logger } from "./shared/utils/logger";
import { checkDatabaseConnection } from "./config/db";


const bootstrap = async (): Promise<void> => {
  try {
    await checkDatabaseConnection();

    app.listen(envs.PORT, () => {
      logger.info(
        `[SERVER] Servidor corriendo en puerto ${envs.PORT} (Entorno: ${envs.NODE_ENV})`,
      );
    });
  } catch (error) {
    logger.error(
      { err: error },
      "[SERVER CRITICAL] Fallo en el arranque de la aplicación",
    );

    process.exit(1);
  }
};

bootstrap();
