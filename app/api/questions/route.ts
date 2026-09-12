import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { getWallPage } from "@/lib/queries/wall";
import { getClientIp, hashIp } from "@/lib/security/ip";
import {
  looksLikeSpam,
  QUESTION_MAX_LENGTH,
  QUESTION_MIN_LENGTH,
  sanitizeText,
} from "@/lib/security/content";
import { checkRateLimit, recordRateLimitEvent } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  const cursorParam = request.nextUrl.searchParams.get("cursor");
  const cursor = cursorParam ? new Date(cursorParam) : null;

  if (cursorParam && Number.isNaN(cursor?.getTime())) {
    return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
  }

  const page = await getWallPage(cursor);
  return NextResponse.json(page);
}

const submitSchema = z.object({
  content: z.string().min(1).max(QUESTION_MAX_LENGTH * 2), // generous pre-sanitize cap
  website: z.string().max(200).optional().default(""), // honeypot, must stay empty
  renderedAt: z.number().optional(),
  parentId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  // Weak but free signal: reject obvious cross-site form submissions.
  // Not relied upon alone — combined with rate limiting + honeypot below.
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { content, website, renderedAt, parentId } = parsed.data;

  // Honeypot field: real users never fill this in. Pretend success so bots
  // don't learn to look elsewhere.
  if (website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // Forms filled in under 1.5s are almost certainly scripted.
  if (typeof renderedAt === "number" && Date.now() - renderedAt < 1500) {
    return NextResponse.json({ ok: true });
  }

  const sanitized = sanitizeText(content);
  if (sanitized.length < QUESTION_MIN_LENGTH) {
    return NextResponse.json(
      { error: `Question must be at least ${QUESTION_MIN_LENGTH} characters.` },
      { status: 400 },
    );
  }
  if (sanitized.length > QUESTION_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Question must be ${QUESTION_MAX_LENGTH} characters or fewer.` },
      { status: 400 },
    );
  }
  if (looksLikeSpam(sanitized)) {
    return NextResponse.json(
      { error: "That looks like spam. Please rephrase your question." },
      { status: 400 },
    );
  }

  // A follow-up may only target a question that's already public (answered)
  // and is itself a root - this keeps threads exactly one level deep, which
  // is all the UI ever offers a "Follow up" button for.
  let validatedParentId: string | null = null;
  if (parentId) {
    const [parent] = await db
      .select({ id: questions.id, parentId: questions.parentId, status: questions.status })
      .from(questions)
      .where(eq(questions.id, parentId));

    if (!parent || parent.status !== "answered" || parent.parentId !== null) {
      return NextResponse.json({ error: "That question can't be followed up on." }, { status: 400 });
    }
    validatedParentId = parent.id;
  }

  const ip = getClientIp(request);
  const ipHash = await hashIp(ip);

  const rateLimitKey = `submit:${ipHash}`;
  const { allowed } = await checkRateLimit(rateLimitKey, [
    { windowMs: 15 * 60 * 1000, max: 5 },
    { windowMs: 24 * 60 * 60 * 1000, max: 20 },
  ]);
  if (!allowed) {
    return NextResponse.json(
      { error: "You're sending questions too fast. Please try again later." },
      { status: 429 },
    );
  }

  await db.insert(questions).values({ content: sanitized, ipHash, parentId: validatedParentId });
  await recordRateLimitEvent(rateLimitKey);

  return NextResponse.json({ ok: true });
}
