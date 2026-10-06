import express, { Application } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
import apiRoutes from "./app.routes";
import { envs } from "./config/envs";
import { globalErrorHandler } from "./shared/middlewares/error.middleware";
import { requestIdMiddleware } from "./shared/middlewares/request-id.middleware";
import { notFoundMiddleware } from "./shared/middlewares/not-found.middleware";
import { ipRateLimiter } from "./shared/middlewares/rate-limit.middleware";

const app: Application = express();



app.use(requestIdMiddleware);

if (envs.TRUST_PROXY_HOPS > 0) {
  app.set("trust proxy", envs.TRUST_PROXY_HOPS);
}

if (envs.NODE_ENV === "production") {
  app.use(morgan("common"));
} else {
  app.use(morgan("dev"));
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,

    strictTransportSecurity:
      envs.NODE_ENV === "production"
        ? {
            maxAge: 15_552_000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
  }),
);

//configuración de CORS
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Requests server-to-server, curl, Postman, etc.
    // normalmente no envían Origin.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (envs.CORS_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    // No devolvemos headers CORS para orígenes no permitidos.
    callback(null, false);
  },

  methods: ["GET", "OPTIONS"],

  allowedHeaders: [
    "Authorization",
    "Content-Type",
  ],

  exposedHeaders: [
    "X-Request-Id",
    "RateLimit-Limit",
    "RateLimit-Remaining",
    "RateLimit-Reset",
    "Retry-After",
  ],

  credentials: false,
  maxAge: 86_400,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));

// Montaje de rutas unificadas
app.use("/api", ipRateLimiter, apiRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Servidor funcionando correctamente",
    environment: envs.NODE_ENV,
  });
});

// Ninguna ruta coincidió
app.use(notFoundMiddleware);

// Manejador de errores global (Debe ir siempre al final de las rutas)
app.use(globalErrorHandler);

export default app;
