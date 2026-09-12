"use client";

import { useEffect, useRef, useState } from "react";

import { CheckIcon, SendIcon, SpinnerIcon } from "@/components/icons";

const MAX_LENGTH = 1500;

type Status = "idle" | "submitting" | "success" | "error";

interface AskFormProps {
  autoFocus?: boolean;
  /** Called once, right when the submission succeeds. */
  onSuccess?: () => void;
  /**
   * Called when the user dismisses the success screen. If omitted, the form
   * resets itself in place so the same visitor can ask another question.
   */
  onDone?: () => void;
  /** Root question id this submission should be threaded under, if any. */
  parentId?: string;
  /** Short quoted excerpt of the question being followed up on. */
  parentPreview?: string;
}

export function AskForm({
  autoFocus = false,
  onSuccess,
  onDone,
  parentId,
  parentPreview,
}: AskFormProps) {
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const renderedAtRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    renderedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!autoFocus) return;
    const id = window.setTimeout(() => textareaRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [autoFocus]);

  function reset() {
    setContent("");
    setWebsite("");
    setStatus("idle");
    setError(null);
    renderedAtRef.current = Date.now();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (trimmed.length < 3) {
      setError("Your question needs to be at least 3 characters.");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          website,
          renderedAt: renderedAtRef.current,
          parentId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      onSuccess?.();
    } catch {
      setStatus("error");
      setError("Network error. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-gradient-brand">
          <CheckIcon className="size-7 text-black" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Question sent!</h3>
          <p className="mt-1 text-sm text-muted">
            It&apos;s completely anonymous. If it gets answered, it&apos;ll show up on the wall.
          </p>
        </div>
        <button
          type="button"
          onClick={() => (onDone ? onDone() : reset())}
          className="mt-2 rounded-full border border-border px-5 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
        >
          {onDone ? "Done" : "Ask another question"}
        </button>
      </div>
    );
  }

  const remaining = MAX_LENGTH - content.length;

  return (
    <form onSubmit={handleSubmit}>
      {parentPreview && (
        <p dir="auto" className="mb-3 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs text-muted">
          Following up on: <span className="italic">&ldquo;{parentPreview}&rdquo;</span>
        </p>
      )}
      <textarea
        ref={textareaRef}
        dir="auto"
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
        maxLength={MAX_LENGTH}
        rows={4}
        placeholder="What do you want to ask?"
        disabled={status === "submitting"}
        className="w-full resize-none rounded-2xl border border-border bg-background/60 p-4 text-sm text-foreground placeholder:text-muted focus:border-accent-a/60 focus:outline-none focus:ring-2 focus:ring-accent-a/20"
      />
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className={error ? "text-danger" : "invisible"}>{error}</span>
        <span className={remaining < 100 ? "text-danger" : "text-muted"}>{remaining}</span>
      </div>

      {/* Honeypot field: hidden from real users via CSS, catches basic bots. */}
      <div className="absolute -left-[9999px] top-auto size-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting" || content.trim().length < 3}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 font-medium text-black transition-opacity disabled:opacity-40"
      >
        {status === "submitting" ? (
          <SpinnerIcon className="size-5 animate-spin-slow" />
        ) : (
          <SendIcon className="size-4" />
        )}
        Send anonymously
      </button>
    </form>
  );
}
