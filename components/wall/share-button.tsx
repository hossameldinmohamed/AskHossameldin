"use client";

import { useEffect, useRef, useState } from "react";

import { CheckIcon, DownloadIcon, LinkIcon, ShareIcon } from "@/components/icons";

interface ShareButtonProps {
  /** Path to the permalink, e.g. `/q/<id>` - resolved against the current origin. */
  path: string;
  /** Id of the question, used to fetch its branded preview image for download. */
  questionId: string;
  title: string;
  text: string;
}

const PLATFORMS = [
  {
    key: "x",
    label: "X",
    shareUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: "whatsapp",
    label: "WA",
    shareUrl: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  {
    key: "facebook",
    label: "f",
    shareUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "linkedin",
    label: "in",
    shareUrl: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

export function ShareButton({ path, questionId, title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  function getUrl() {
    return new URL(path, window.location.origin).toString();
  }

  async function handleClick() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: getUrl() });
      } catch {
        // User cancelled the share sheet - not an error.
      }
      return;
    }
    setMenuOpen((open) => !open);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setMenuOpen(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable - silently do nothing rather than error.
    }
  }

  async function downloadImage() {
    setDownloading(true);
    try {
      const res = await fetch(`/q/${questionId}/opengraph-image`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${questionId}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      setMenuOpen(false);
    } catch {
      // Silently do nothing rather than error - this is a convenience extra.
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        {copied ? <CheckIcon className="size-3.5 text-success" /> : <ShareIcon className="size-3.5" />}
        {copied ? "Link copied" : "Share"}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 flex animate-scale-in items-center gap-1 rounded-full border border-border bg-surface p-1.5 shadow-lg">
          {PLATFORMS.map((platform) => (
            <a
              key={platform.key}
              href={platform.shareUrl(getUrl(), text)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex size-8 items-center justify-center rounded-full bg-background text-[11px] font-bold text-foreground/80 transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              {platform.label}
            </a>
          ))}
          <button
            type="button"
            onClick={downloadImage}
            disabled={downloading}
            aria-label="Download preview image"
            title="Download preview image (attach it manually on X)"
            className="flex size-8 items-center justify-center rounded-full bg-background text-foreground/80 transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
          >
            <DownloadIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy link"
            className="flex size-8 items-center justify-center rounded-full bg-background text-foreground/80 transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <LinkIcon className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
