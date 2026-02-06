import * as dotenv from "dotenv";

dotenv.config();

export type Env = {
  port: number;
  corsOrigin: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  publicBaseUrl?: string;
  uploadDir: string;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
};

let cachedEnv: Env | undefined;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const portRaw = Number.parseInt(process.env.PORT ?? "3000", 10);
  const dbPortRaw = Number.parseInt(process.env.DB_PORT ?? "5432", 10);

  cachedEnv = {
    port: Number.isFinite(portRaw) ? portRaw : 3000,
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
    publicBaseUrl: process.env.PUBLIC_BASE_URL,
    uploadDir: process.env.UPLOAD_DIR ?? "uploads",
    db: {
      host: process.env.DB_HOST ?? "localhost",
      port: Number.isFinite(dbPortRaw) ? dbPortRaw : 5432,
      user: process.env.DB_USER ?? "hortti",
      password: process.env.DB_PASSWORD ?? "hortti",
      database: process.env.DB_NAME ?? "hortti_inventory",
    },
  };

  return cachedEnv;
}

export function resetEnvCache(): void {
  cachedEnv = undefined;
}

