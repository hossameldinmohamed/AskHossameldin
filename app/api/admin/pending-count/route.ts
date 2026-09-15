import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/auth/require-admin";
import { getPendingCount } from "@/lib/queries/wall";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await getPendingCount();
  return NextResponse.json({ count });
}
