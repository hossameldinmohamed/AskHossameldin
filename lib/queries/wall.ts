import { and, asc, desc, eq, inArray, isNull, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import type { PublicQuestion } from "@/lib/types";

export const WALL_PAGE_SIZE = 12;

const publicFields = {
  id: questions.id,
  content: questions.content,
  answer: questions.answer,
  answeredAt: questions.answeredAt,
};

export interface WallPage {
  items: PublicQuestion[];
  nextCursor: string | null;
}

/**
 * One page of the public wall: root answered questions (paginated by
 * answeredAt cursor), each with its own answered follow-ups nested inline.
 */
export async function getWallPage(cursor: Date | null): Promise<WallPage> {
  const rootFilter = and(
    eq(questions.status, "answered"),
    isNull(questions.parentId),
    cursor ? lt(questions.answeredAt, cursor) : undefined,
  );

  const rows = await db
    .select(publicFields)
    .from(questions)
    .where(rootFilter)
    .orderBy(desc(questions.answeredAt))
    .limit(WALL_PAGE_SIZE + 1);

  const hasMore = rows.length > WALL_PAGE_SIZE;
  const roots = rows.slice(0, WALL_PAGE_SIZE);
  const nextCursor = hasMore ? roots[roots.length - 1]?.answeredAt?.toISOString() ?? null : null;

  const rootIds = roots.map((r) => r.id);
  const followUps = rootIds.length
    ? await db
        .select({ ...publicFields, parentId: questions.parentId })
        .from(questions)
        .where(and(eq(questions.status, "answered"), inArray(questions.parentId, rootIds)))
        .orderBy(asc(questions.answeredAt))
    : [];

  const followUpsByParent = new Map<string, PublicQuestion[]>();
  for (const followUp of followUps) {
    const list = followUpsByParent.get(followUp.parentId!) ?? [];
    list.push({
      id: followUp.id,
      content: followUp.content,
      answer: followUp.answer,
      answeredAt: followUp.answeredAt ? new Date(followUp.answeredAt).toISOString() : null,
    });
    followUpsByParent.set(followUp.parentId!, list);
  }

  const items: PublicQuestion[] = roots.map((root) => ({
    id: root.id,
    content: root.content,
    answer: root.answer,
    answeredAt: root.answeredAt ? new Date(root.answeredAt).toISOString() : null,
    followUps: followUpsByParent.get(root.id),
  }));

  return { items, nextCursor };
}

export interface PermalinkQuestion extends PublicQuestion {
  parent: { id: string; content: string } | null;
}

/** A single answered question (root or follow-up) for its /q/[id] permalink page. */
export async function getQuestionById(id: string): Promise<PermalinkQuestion | null> {
  const [row] = await db
    .select({ ...publicFields, parentId: questions.parentId, status: questions.status })
    .from(questions)
    .where(eq(questions.id, id));

  if (!row || row.status !== "answered") return null;

  let parent: { id: string; content: string } | null = null;
  if (row.parentId) {
    const [parentRow] = await db
      .select({ id: questions.id, content: questions.content })
      .from(questions)
      .where(eq(questions.id, row.parentId));
    parent = parentRow ?? null;
  }

  let followUps: PublicQuestion[] | undefined;
  if (!row.parentId) {
    const rows = await db
      .select(publicFields)
      .from(questions)
      .where(and(eq(questions.status, "answered"), eq(questions.parentId, row.id)))
      .orderBy(asc(questions.answeredAt));
    followUps = rows.length
      ? rows.map((f) => ({ ...f, answeredAt: f.answeredAt ? new Date(f.answeredAt).toISOString() : null }))
      : undefined;
  }

  return {
    id: row.id,
    content: row.content,
    answer: row.answer,
    answeredAt: row.answeredAt ? new Date(row.answeredAt).toISOString() : null,
    followUps,
    parent,
  };
}

export async function getAnsweredCount(): Promise<number> {
  const [row] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(questions)
    .where(eq(questions.status, "answered"));
  return row?.value ?? 0;
}

export async function getPendingCount(): Promise<number> {
  const [row] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(questions)
    .where(eq(questions.status, "pending"));
  return row?.value ?? 0;
}
