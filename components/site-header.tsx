import Link from "next/link";

import { siteConfig } from "@/lib/site";

/**
 * Compact branded header for pages other than the homepage (e.g. a shared
 * /q/[id] permalink), so landing there directly still feels like part of
 * the same site rather than a bare, disconnected card.
 */
export function SiteHeader() {
  return (
    <div className="mx-auto flex w-full max-w-2xl items-center px-4 pt-6 sm:px-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-brand text-xs font-bold text-black">
          {siteConfig.name.charAt(0)}
        </span>
        {siteConfig.title}
      </Link>
    </div>
  );
}
