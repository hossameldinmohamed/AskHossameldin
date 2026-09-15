import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { toggleLike } from "@/lib/queries/likes";
import { getClientIp, hashIp } from "@/lib/security/ip";
import { checkRateLimit, recordRateLimitEvent } from "@/lib/security/rate-limit";

const idSchema = z.string().uuid();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { id } = await params;
  const idResult = idSchema.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid question id." }, { status: 400 });
  }

  const [question] = await db
    .select({ id: questions.id, status: questions.status })
    .from(questions)
    .where(eq(questions.id, idResult.data));

  if (!question || question.status !== "answered") {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }

  const ipHash = await hashIp(getClientIp(request.headers));
  const rateLimitKey = `like:${ipHash}`;
  const { allowed } = await checkRateLimit(rateLimitKey, [{ windowMs: 60 * 1000, max: 60 }]);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }
  await recordRateLimitEvent(rateLimitKey);

  const result = await toggleLike(idResult.data, ipHash);
  return NextResponse.json(result);
}
