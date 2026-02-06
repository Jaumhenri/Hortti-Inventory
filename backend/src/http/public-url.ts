import type { Request } from "express";

import { getEnv } from "../env";

export function getPublicBaseUrl(req: Request): string {
  const env = getEnv();
  if (env.publicBaseUrl) return env.publicBaseUrl.replace(/\/$/, "");

  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto =
    (typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0]?.trim()
      : undefined) ?? req.protocol;

  const forwardedHost = req.headers["x-forwarded-host"];
  const host =
    (typeof forwardedHost === "string" ? forwardedHost : undefined) ??
    req.get("host") ??
    "localhost";

  return `${proto}://${host}`;
}

