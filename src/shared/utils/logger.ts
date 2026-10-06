import pino from "pino";
import { envs } from "../../config/envs";

const isDevelopment = envs.NODE_ENV === "development";

const errorSerializer = (error: unknown) => {
  if (!(error instanceof Error)) {
    return error;
  }

  const err = error as Error & {
    code?: string;
    errno?: number;
    sqlState?: string;
  };

  const isMysqlError =
    err.code !== undefined ||
    err.errno !== undefined ||
    err.sqlState !== undefined;

  if (isMysqlError) {
    return {
      type: err.name || "MysqlError",
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
    };
  }

  return pino.stdSerializers.err(err);
};

export const logger = pino({
  level: isDevelopment ? "debug" : "info",

  serializers: {
    err: errorSerializer,
    error: errorSerializer,
  },

  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "authorization",
      "token",
      "apiToken",
      "apiKey",
      "password",
      "*.password",
      "*.token",
      "*.apiToken",
      "*.apiKey",
    ],
    censor: "[REDACTED]",
  },

  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
});