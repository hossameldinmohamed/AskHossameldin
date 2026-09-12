import { asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { isAdminRequest } from "@/lib/auth/require-admin";

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") ?? "pending";
  if (!["pending", "answered", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const rows = await db
    .select({
      id: questions.id,
      content: questions.content,
      answer: questions.answer,
      status: questions.status,
      createdAt: questions.createdAt,
      answeredAt: questions.answeredAt,
    })
    .from(questions)
    .where(eq(questions.status, status as "pending" | "answered" | "rejected"))
    .orderBy(status === "pending" ? asc(questions.createdAt) : desc(questions.createdAt))
    .limit(200);

  return NextResponse.json({ items: rows });
}
