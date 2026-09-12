import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add a Postgres connection string (e.g. from Vercel Postgres / Neon) to your environment variables.",
  );
}

// A standard `pg` Pool works against any Postgres (local Docker, Neon,
// Vercel Postgres, Supabase, ...). On serverless, point DATABASE_URL at a
// pooled connection string (e.g. Neon's PgBouncer endpoint) to avoid
// exhausting the database's connection limit.
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const pool =
  global.__pgPool ??
  new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

export const db = drizzle(pool, { schema });
