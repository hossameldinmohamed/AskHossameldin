import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { isAdminRequest } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { ANSWER_MAX_LENGTH, sanitizeText } from "@/lib/security/content";

const idSchema = z.string().uuid();

const returningFields = {
  id: questions.id,
  content: questions.content,
  answer: questions.answer,
  status: questions.status,
  createdAt: questions.createdAt,
  answeredAt: questions.answeredAt,
};

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("answer"), answer: z.string().min(1).max(ANSWER_MAX_LENGTH * 2) }),
  z.object({ action: z.literal("reject") }),
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const idResult = idSchema.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid question id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (parsed.data.action === "answer") {
    const sanitized = sanitizeText(parsed.data.answer);
    if (sanitized.length < 1 || sanitized.length > ANSWER_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Answer must be 1-${ANSWER_MAX_LENGTH} characters.` },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(questions)
      .set({ answer: sanitized, status: "answered", answeredAt: new Date() })
      .where(eq(questions.id, idResult.data))
      .returning(returningFields);

    if (!updated) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }
    return NextResponse.json({ item: updated });
  }

  const [updated] = await db
    .update(questions)
    .set({ status: "rejected" })
    .where(eq(questions.id, idResult.data))
    .returning(returningFields);

  if (!updated) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }
  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const idResult = idSchema.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid question id." }, { status: 400 });
  }

  await db.delete(questions).where(eq(questions.id, idResult.data));
  return NextResponse.json({ ok: true });
}
