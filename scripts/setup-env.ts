import { randomBytes } from "node:crypto";

import { hashPassword } from "../lib/auth/password";

const password = process.argv[2];

if (!password || password.length < 8) {
  console.error("Usage: npm run setup-env -- <admin-password>");
  console.error("The password must be at least 8 characters.");
  process.exit(1);
}

const adminPasswordHash = hashPassword(password);
const sessionSecret = randomBytes(48).toString("base64");
const ipHashSecret = randomBytes(32).toString("base64");

console.log("\nAdd these to your .env.local (and to your Vercel project's environment variables):\n");
console.log(`ADMIN_PASSWORD_HASH=${adminPasswordHash}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log(`IP_HASH_SECRET=${ipHashSecret}`);
console.log("\nKeep these secret — never commit them to git.\n");
