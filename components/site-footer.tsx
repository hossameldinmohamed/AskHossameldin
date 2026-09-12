import Link from "next/link";

import { LockIcon } from "@/components/icons";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { getPendingCount } from "@/lib/queries/wall";

export async function SiteFooter() {
  const isAdmin = await isAdminRequest();
  const pendingCount = isAdmin ? await getPendingCount() : 0;

  return (
    <footer className="flex justify-center pb-10 pt-4">
      <Link
        href="/admin"
        className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted transition-colors hover:bg-surface hover:text-foreground"
      >
        <LockIcon className="size-3.5" />
        Admin
        {isAdmin && pendingCount > 0 && (
          <span
            className="flex min-w-[1.15rem] items-center justify-center rounded-full bg-gradient-brand px-1.5 py-0.5 text-[10px] font-bold leading-none text-black"
            title={`${pendingCount} question${pendingCount === 1 ? "" : "s"} waiting for an answer`}
          >
            {pendingCount}
          </span>
        )}
      </Link>
    </footer>
  );
}
