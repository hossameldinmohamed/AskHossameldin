"use client";

import { useState } from "react";

import { CheckIcon, SpinnerIcon, XIcon } from "@/components/icons";
import { formatRelativeTime } from "@/lib/format";
import { ANSWER_MAX_LENGTH } from "@/lib/security/content";
import type { AdminQuestion } from "@/lib/types";

interface PendingItemProps {
  item: AdminQuestion;
  onAnswered: (item: AdminQuestion) => void;
  onRejected: (id: string) => void;
}

export function PendingItem({ item, onAnswered, onRejected }: PendingItemProps) {
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState<"answer" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(action: "answer" | "reject") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/questions/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "answer" ? { action: "answer", answer: answer.trim() } : { action: "reject" },
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setBusy(null);
        return;
      }
      if (action === "answer") {
        onAnswered(data.item);
      } else {
        onRejected(item.id);
      }
    } catch {
      setError("Network error. Please try again.");
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      {item.parentId && (
        <p className="mb-2 truncate text-xs text-accent-b">
          Follow-up to: &ldquo;{item.parentContent ?? "a previous question"}&rdquo;
        </p>
      )}
      <div className="flex items-start justify-between gap-3">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{item.content}</p>
        <span className="shrink-0 text-xs text-muted">{formatRelativeTime(item.createdAt)}</span>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value.slice(0, ANSWER_MAX_LENGTH))}
        placeholder="Write your answer…"
        rows={3}
        disabled={busy !== null}
        className="mt-4 w-full resize-none rounded-xl border border-border bg-background/60 p-3 text-sm placeholder:text-muted focus:border-accent-a/60 focus:outline-none focus:ring-2 focus:ring-accent-a/20"
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted">
          {ANSWER_MAX_LENGTH - answer.length} characters left
        </span>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-danger">{error}</span>}
          <button
            type="button"
            onClick={() => submit("reject")}
            disabled={busy !== null}
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-surface-hover disabled:opacity-40"
          >
            {busy === "reject" ? <SpinnerIcon className="size-3.5 animate-spin-slow" /> : <XIcon className="size-3.5" />}
            Reject
          </button>
          <button
            type="button"
            onClick={() => submit("answer")}
            disabled={busy !== null || answer.trim().length === 0}
            className="flex items-center gap-1.5 rounded-full bg-gradient-brand px-3.5 py-1.5 text-xs font-semibold text-black transition-opacity disabled:opacity-40"
          >
            {busy === "answer" ? <SpinnerIcon className="size-3.5 animate-spin-slow" /> : <CheckIcon className="size-3.5" />}
            Publish answer
          </button>
        </div>
      </div>
    </div>
  );
}
