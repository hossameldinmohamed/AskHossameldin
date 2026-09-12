interface HeaderLike {
  get(name: string): string | null;
}

/**
 * Best-effort client IP extraction behind Vercel's proxy. Never trusted for
 * anything beyond rate limiting / abuse mitigation. Accepts anything with a
 * `.get()` method so it works both from a Route Handler's `request.headers`
 * and from a Server Component's `headers()`.
 */
export function getClientIp(headers: HeaderLike): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * We never store raw IP addresses. Instead we keep a salted SHA-256 hash,
 * which is enough to rate-limit and detect abuse without retaining PII.
 */
export async function hashIp(ip: string): Promise<string> {
  const secret = process.env.IP_HASH_SECRET;
  if (!secret) {
    throw new Error("IP_HASH_SECRET is not set.");
  }
  const data = new TextEncoder().encode(`${secret}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
