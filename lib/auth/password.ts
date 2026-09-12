import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

// Format: scrypt:<salt-hex>:<hash-hex>. Used to seed ADMIN_PASSWORD_HASH.
// Deliberately avoids "$" as a separator: many env-var loaders (including
// Next.js's dotenv-based one) perform shell-style "$name" interpolation on
// .env values, which would silently truncate a "$"-delimited hash.
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hashHex] = parts;

  try {
    const expected = Buffer.from(hashHex!, "hex");
    const actual = scryptSync(password, salt!, KEY_LENGTH);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
