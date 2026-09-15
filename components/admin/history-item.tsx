"use client";

import { useState } from "react";

import { SpinnerIcon, TrashIcon } from "@/components/icons";
import { RichAnswer } from "@/components/wall/rich-answer";
import { ShareButton } from "@/components/wall/share-button";
import { formatAbsoluteTime, formatRelativeTime } from "@/lib/format";
import type { AdminQuestion } from "@/lib/types";

export function HistoryItem({
  item,
  onDeleted,
}: {
  item: AdminQuestion;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Permanently delete this question? This can't be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/questions/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(item.id);
      } else {
        setDeleting(false);
      }
    } catch {
      setDeleting(false);
    }
  }

  const timestamp = item.status === "answered" && item.answeredAt ? item.answeredAt : item.createdAt;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      {item.parentId && (
        <p dir="auto" className="mb-2 truncate text-xs text-accent-b">
          Follow-up to: &ldquo;{item.parentContent ?? "a previous question"}&rdquo;
        </p>
      )}
      <div className="flex items-start justify-between gap-3">
        <p dir="auto" className="whitespace-pre-wrap text-[15px] leading-relaxed">{item.content}</p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete question"
          className="shrink-0 rounded-full p-2 text-muted transition-colors hover:bg-surface-hover hover:text-danger disabled:opacity-40"
        >
          {deleting ? <SpinnerIcon className="size-4 animate-spin-slow" /> : <TrashIcon className="size-4" />}
        </button>
      </div>

      {item.answer && (
        <div className="mt-3 border-t border-border pt-3">
          <p dir="auto" className="whitespace-pre-wrap text-sm text-foreground/85">
            {item.answer}
          </p>
          <RichAnswer text={item.answer} />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-muted" title={formatAbsoluteTime(timestamp)}>
          {item.status === "answered" && item.answeredAt
            ? `Answered ${formatRelativeTime(item.answeredAt)}`
            : `Rejected · asked ${formatRelativeTime(item.createdAt)}`}
        </p>

        {item.status === "answered" && item.answer && (
          <ShareButton path={`/q/${item.id}`} questionId={item.id} />
        )}
      </div>
    </div>
  );
}
