"use client";

import { useEffect, useState } from "react";

import { AskForm } from "@/components/ask/ask-form";
import { ReplyIcon, XIcon } from "@/components/icons";

interface FollowUpButtonProps {
  questionId: string;
  questionContent: string;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function FollowUpButton({ questionId, questionContent }: FollowUpButtonProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <ReplyIcon className="size-3.5" />
        Follow up
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Follow up on this question"
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in-up"
            style={{ animationDuration: "0.15s" }}
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-lg animate-scale-in rounded-t-3xl border border-border bg-surface p-6 shadow-2xl sm:rounded-3xl sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <XIcon className="size-5" />
            </button>

            <h3 className="mb-4 text-lg font-semibold">Ask a follow-up</h3>

            <AskForm
              autoFocus
              parentId={questionId}
              parentPreview={truncate(questionContent, 140)}
              onDone={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
