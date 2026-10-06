interface EnvironmentConfig {
  NODE_ENV: "development" | "test" | "production";
  APP_ENV: "local" | "qa" | "production";

  PORT: number;

  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  CORS_ORIGINS: string[];

  RATE_LIMIT_WINDOW_MS: number;
  IP_RATE_LIMIT_MAX: number;
  CLIENT_RATE_LIMIT_MAX: number;

  TRUST_PROXY_HOPS: number;

  API_TOKEN_TTL_MONTHS: number;
}

type NodeEnvironment = EnvironmentConfig["NODE_ENV"];
type AppEnvironment = EnvironmentConfig["APP_ENV"];

const getEnvVar = (
  key: string,
  defaultValue?: string,
  allowEmpty = false,
): string => {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(
      `[CONFIG] La variable de entorno '${key}' no está definida`,
    );
  }

  if (!allowEmpty && value.trim() === "") {
    throw new Error(
      `[CONFIG] La variable de entorno '${key}' no puede estar vacía`,
    );
  }

  return value.trim();
};

const getPositiveInteger = (
  key: string,
  defaultValue?: string,
): number => {
  const rawValue = getEnvVar(key, defaultValue);
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      `[CONFIG] La variable '${key}' debe ser un entero positivo`,
    );
  }

  return value;
};

const parseNodeEnv = (): NodeEnvironment => {
  const value = getEnvVar("NODE_ENV", "development").toLowerCase();

  if (
    value !== "development" &&
    value !== "test" &&
    value !== "production"
  ) {
    throw new Error(
      "[CONFIG] NODE_ENV debe ser development, test o production",
    );
  }

  return value;
};

const parseAppEnv = (): AppEnvironment => {
  const value = getEnvVar("APP_ENV", "local").toLowerCase();

  if (value !== "local" && value !== "qa" && value !== "production") {
    throw new Error(
      "[CONFIG] APP_ENV debe ser local, qa o production",
    );
  }

  return value;
};

const parseCorsOrigins = (): string[] => {
  const value = getEnvVar("CORS_ORIGINS", "", true);

  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const getNonNegativeInteger = (
  key: string,
  defaultValue?: string,
): number => {
  const rawValue = getEnvVar(key, defaultValue);
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(
      `[CONFIG] La variable '${key}' debe ser un entero mayor o igual a 0`,
    );
  }

  return value;
};

const nodeEnv = parseNodeEnv();
const appEnv = parseAppEnv();

const dbPrefix = appEnv.toUpperCase();

export const envs: EnvironmentConfig = {
  NODE_ENV: nodeEnv,
  APP_ENV: appEnv,

  PORT: getPositiveInteger("PORT", "3000"),

  DB_HOST: getEnvVar(`${dbPrefix}_DB_HOST`),
  DB_PORT: getPositiveInteger(`${dbPrefix}_DB_PORT`, "3306"),
  DB_USER: getEnvVar(`${dbPrefix}_DB_USER`),
  DB_PASSWORD: getEnvVar(
    `${dbPrefix}_DB_PASSWORD`,
    undefined,
    appEnv === "local",
  ),
  DB_NAME: getEnvVar(`${dbPrefix}_DB_NAME`),
  
  CORS_ORIGINS: parseCorsOrigins(),

  RATE_LIMIT_WINDOW_MS: getPositiveInteger(
    "RATE_LIMIT_WINDOW_MS",
    "60000",
  ),
  IP_RATE_LIMIT_MAX: getPositiveInteger(
    "IP_RATE_LIMIT_MAX",
    "120",
  ),
  CLIENT_RATE_LIMIT_MAX: getPositiveInteger(
    "CLIENT_RATE_LIMIT_MAX",
    "60",
  ),
  TRUST_PROXY_HOPS: getNonNegativeInteger(
    "TRUST_PROXY_HOPS",
    "0",
  ),

  API_TOKEN_TTL_MONTHS: getPositiveInteger(
    "API_TOKEN_TTL_MONTHS",
    "12",
  ),
};