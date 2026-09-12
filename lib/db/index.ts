import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

// A standard `pg` Pool works against any Postgres (local Docker, Neon,
// Vercel Postgres, Supabase, ...). On serverless, point DATABASE_URL at a
// pooled connection string (e.g. Neon's PgBouncer endpoint) to avoid
// exhausting the database's connection limit.
declare global {
  var __pgPool: Pool | undefined;
}

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cachedDb: Db | undefined;

// Lazy on purpose: Next.js imports every route module during `next build`
// (to read its config) without ever calling into it, and again during
// local dev whenever the file graph is walked. Throwing or connecting at
// module load time would break the build/dev-server startup even though
// DATABASE_URL is only ever needed once a request actually runs.
function getDb(): Db {
  if (cachedDb) return cachedDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add a Postgres connection string (e.g. from Vercel Postgres / Neon) to your environment variables.",
    );
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

  cachedDb = drizzle(pool, { schema });
  return cachedDb;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
