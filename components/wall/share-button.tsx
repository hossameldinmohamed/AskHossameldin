"use client";

import { useState } from "react";

import { CheckIcon, ShareIcon } from "@/components/icons";

interface ShareButtonProps {
  /** Path to the permalink, e.g. `/q/<id>` - resolved against the current origin. */
  path: string;
  title: string;
  text: string;
}

export function ShareButton({ path, title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = new URL(path, window.location.origin).toString();

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // User cancelled the share sheet - not an error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable - silently do nothing rather than error.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
    >
      {copied ? <CheckIcon className="size-3.5 text-success" /> : <ShareIcon className="size-3.5" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
