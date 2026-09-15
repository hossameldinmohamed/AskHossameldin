import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { questionLikes } from "@/lib/db/schema";

export async function getLikeCounts(questionIds: string[]): Promise<Map<string, number>> {
  if (questionIds.length === 0) return new Map();

  const rows = await db
    .select({ questionId: questionLikes.questionId, count: sql<number>`count(*)::int` })
    .from(questionLikes)
    .where(inArray(questionLikes.questionId, questionIds))
    .groupBy(questionLikes.questionId);

  return new Map(rows.map((r) => [r.questionId, r.count]));
}

export async function getLikedSet(questionIds: string[], ipHash: string): Promise<Set<string>> {
  if (questionIds.length === 0) return new Set();

  const rows = await db
    .select({ questionId: questionLikes.questionId })
    .from(questionLikes)
    .where(and(inArray(questionLikes.questionId, questionIds), eq(questionLikes.ipHash, ipHash)));

  return new Set(rows.map((r) => r.questionId));
}

/** Toggles a like for (questionId, ipHash). Returns the new state + count. */
export async function toggleLike(
  questionId: string,
  ipHash: string,
): Promise<{ liked: boolean; likeCount: number }> {
  const [existing] = await db
    .select({ id: questionLikes.id })
    .from(questionLikes)
    .where(and(eq(questionLikes.questionId, questionId), eq(questionLikes.ipHash, ipHash)));

  if (existing) {
    await db.delete(questionLikes).where(eq(questionLikes.id, existing.id));
  } else {
    await db.insert(questionLikes).values({ questionId, ipHash }).onConflictDoNothing();
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(questionLikes)
    .where(eq(questionLikes.questionId, questionId));

  return { liked: !existing, likeCount: count };
}
