import { asc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const parentQuestions = alias(questions, "parent_questions");

export default async function AdminPage() {
  const rows = await db
    .select({
      id: questions.id,
      content: questions.content,
      answer: questions.answer,
      status: questions.status,
      createdAt: questions.createdAt,
      answeredAt: questions.answeredAt,
      parentId: questions.parentId,
      parentContent: parentQuestions.content,
    })
    .from(questions)
    .leftJoin(parentQuestions, eq(questions.parentId, parentQuestions.id))
    .where(eq(questions.status, "pending"))
    .orderBy(asc(questions.createdAt))
    .limit(200);

  const initialPending = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    answeredAt: r.answeredAt ? r.answeredAt.toISOString() : null,
  }));

  return <AdminDashboard initialPending={initialPending} />;
}
