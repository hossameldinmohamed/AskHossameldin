import { and, eq, gt, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { rateLimitEvents } from "@/lib/db/schema";

interface RateLimitWindow {
  windowMs: number;
  max: number;
}

/**
 * DB-backed sliding-window rate limiter. No Redis dependency: checks how
 * many events with the same key were recorded within each window.
 */
export async function checkRateLimit(
  key: string,
  windows: RateLimitWindow[],
): Promise<{ allowed: boolean }> {
  for (const w of windows) {
    const since = new Date(Date.now() - w.windowMs);
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rateLimitEvents)
      .where(and(eq(rateLimitEvents.key, key), gt(rateLimitEvents.createdAt, since)));

    if ((rows[0]?.count ?? 0) >= w.max) {
      return { allowed: false };
    }
  }
  return { allowed: true };
}

const MAX_EVENT_AGE_MS = 25 * 60 * 60 * 1000;

export async function recordRateLimitEvent(key: string): Promise<void> {
  await db.insert(rateLimitEvents).values({ key });

  // Opportunistic cleanup so the table doesn't grow unbounded, without
  // needing a cron job. ~2% of writes pay this small extra cost.
  if (Math.random() < 0.02) {
    await db
      .delete(rateLimitEvents)
      .where(lt(rateLimitEvents.createdAt, new Date(Date.now() - MAX_EVENT_AGE_MS)));
  }
}
