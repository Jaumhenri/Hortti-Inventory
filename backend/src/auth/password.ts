import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const DIGEST = "sha256";
const ITERATIONS = 100_000;
const KEY_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derivedKey = pbkdf2Sync(
    password,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    DIGEST,
  );

  return [
    "pbkdf2",
    String(ITERATIONS),
    salt.toString("base64"),
    derivedKey.toString("base64"),
  ].join("$");
}

export function verifyPassword(password: string, stored: string): boolean {
  const [kind, iterationsRaw, saltB64, hashB64] = stored.split("$");
  if (kind !== "pbkdf2") return false;

  const iterations = Number.parseInt(iterationsRaw ?? "", 10);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const salt = Buffer.from(saltB64 ?? "", "base64");
  const expected = Buffer.from(hashB64 ?? "", "base64");
  if (!salt.length || !expected.length) return false;

  const actual = pbkdf2Sync(password, salt, iterations, expected.length, DIGEST);
  return timingSafeEqual(actual, expected);
}

