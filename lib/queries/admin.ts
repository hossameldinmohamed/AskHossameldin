import { alias } from "drizzle-orm/pg-core";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";

import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import type { AdminQuestion, QuestionStatus } from "@/lib/types";

export const ADMIN_PAGE_SIZE = 30;

const parentQuestions = alias(questions, "parent_questions");

const adminFields = {
  id: questions.id,
  content: questions.content,
  answer: questions.answer,
  status: questions.status,
  createdAt: questions.createdAt,
  answeredAt: questions.answeredAt,
  parentId: questions.parentId,
  parentContent: parentQuestions.content,
};

export interface AdminQuestionsPage {
  items: AdminQuestion[];
  nextCursor: string | null;
}

/**
 * Pending is oldest-first (answer the oldest question first); answered and
 * rejected are newest-first (most relevant recent history). The cursor is
 * always the createdAt of the last item on the current page.
 */
export async function getAdminQuestions(
  status: QuestionStatus,
  cursor: Date | null,
): Promise<AdminQuestionsPage> {
  const isPending = status === "pending";
  const cursorFilter = cursor
    ? isPending
      ? gt(questions.createdAt, cursor)
      : lt(questions.createdAt, cursor)
    : undefined;

  const rows = await db
    .select(adminFields)
    .from(questions)
    .leftJoin(parentQuestions, eq(questions.parentId, parentQuestions.id))
    .where(cursorFilter ? and(eq(questions.status, status), cursorFilter) : eq(questions.status, status))
    .orderBy(isPending ? asc(questions.createdAt) : desc(questions.createdAt))
    .limit(ADMIN_PAGE_SIZE + 1);

  const hasMore = rows.length > ADMIN_PAGE_SIZE;
  const page = rows.slice(0, ADMIN_PAGE_SIZE);
  const nextCursor = hasMore ? page[page.length - 1]?.createdAt.toISOString() ?? null : null;

  const items: AdminQuestion[] = page.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    answeredAt: r.answeredAt ? r.answeredAt.toISOString() : null,
  }));

  return { items, nextCursor };
}
