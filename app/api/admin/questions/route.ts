import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isAdminRequest } from "@/lib/auth/require-admin";
import { getAdminQuestions } from "@/lib/queries/admin";
import type { QuestionStatus } from "@/lib/types";

const VALID_STATUSES: QuestionStatus[] = ["pending", "answered", "rejected"];

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") ?? "pending";
  if (!VALID_STATUSES.includes(status as QuestionStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const cursorParam = request.nextUrl.searchParams.get("cursor");
  const cursor = cursorParam ? new Date(cursorParam) : null;
  if (cursorParam && Number.isNaN(cursor?.getTime())) {
    return NextResponse.json({ error: "Invalid cursor." }, { status: 400 });
  }

  const page = await getAdminQuestions(status as QuestionStatus, cursor);
  return NextResponse.json(page);
}
