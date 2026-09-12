import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE, verifySessionToken } from "./session";

/**
 * Defense-in-depth check re-verified inside each admin route handler, in
 * addition to the middleware guard on /api/admin/*.
 */
export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}
