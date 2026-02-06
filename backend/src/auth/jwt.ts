import * as jwt from "jsonwebtoken";

import { getEnv } from "../env";

export type JwtPayload = {
  sub: string;
  username: string;
};

export function signAccessToken(payload: JwtPayload): string {
  const env = getEnv();
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const env = getEnv();
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

