import { gte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";

export async function recordPageView(ipHash: string): Promise<void> {
  await db.insert(pageViews).values({ ipHash });
}

export interface AnalyticsSummary {
  totalViews: number;
  totalUnique: number;
  todayViews: number;
  todayUnique: number;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totals, today] = await Promise.all([
    db
      .select({
        totalViews: sql<number>`count(*)::int`,
        totalUnique: sql<number>`count(distinct ${pageViews.ipHash})::int`,
      })
      .from(pageViews),
    db
      .select({
        todayViews: sql<number>`count(*)::int`,
        todayUnique: sql<number>`count(distinct ${pageViews.ipHash})::int`,
      })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startOfToday)),
  ]);

  return {
    totalViews: totals[0]?.totalViews ?? 0,
    totalUnique: totals[0]?.totalUnique ?? 0,
    todayViews: today[0]?.todayViews ?? 0,
    todayUnique: today[0]?.todayUnique ?? 0,
  };
}
