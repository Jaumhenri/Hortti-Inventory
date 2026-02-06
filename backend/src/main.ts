import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";

import { AppModule } from "./app.module";
import { getEnv } from "./env";

async function bootstrap(): Promise<void> {
  const env = getEnv();

  const app = await NestFactory.create(AppModule, { cors: false });

  app.enableCors({
    origin: env.corsOrigin,
    credentials: true,
  });

  const uploadRoot = path.join(process.cwd(), env.uploadDir);
  fs.mkdirSync(uploadRoot, { recursive: true });
  app.use(`/${env.uploadDir}`, express.static(uploadRoot));

  await app.listen(env.port);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.port}`);
}

void bootstrap();

