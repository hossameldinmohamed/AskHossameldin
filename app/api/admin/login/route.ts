import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password";
import { ADMIN_SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { getClientIp, hashIp } from "@/lib/security/ip";
import { checkRateLimit, recordRateLimitEvent } from "@/lib/security/rate-limit";

const schema = z.object({ password: z.string().min(1).max(200) });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ip = getClientIp(request.headers);
  const ipHash = await hashIp(ip);
  const rateLimitKey = `login:${ipHash}`;

  const { allowed } = await checkRateLimit(rateLimitKey, [
    { windowMs: 15 * 60 * 1000, max: 10 },
  ]);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }
  await recordRateLimitEvent(rateLimitKey);

  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!storedHash || !verifyPassword(parsed.data.password, storedHash)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
