"use client";

import { useEffect, useRef, useState } from "react";

import { CheckIcon, MessageIcon, SendIcon, SpinnerIcon, XIcon } from "@/components/icons";

const MAX_LENGTH = 1500;

type Status = "idle" | "submitting" | "success" | "error";

export function AskWidget() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const renderedAtRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      renderedAtRef.current = Date.now();
      const id = window.setTimeout(() => textareaRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function close() {
    setOpen(false);
    setTimeout(() => {
      setContent("");
      setWebsite("");
      setStatus("idle");
      setError(null);
    }, 200);
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
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setError("Network error. Please check your connection and try again.");
    }
  }

  const remaining = MAX_LENGTH - content.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-3.5 font-medium text-black shadow-lg shadow-fuchsia-500/20 transition-transform hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8"
      >
        <MessageIcon className="size-5" />
        Ask a question
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ask a question"
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in-up"
            style={{ animationDuration: "0.15s" }}
            onClick={close}
          />

          <div className="relative w-full max-w-lg animate-scale-in rounded-t-3xl border border-border bg-surface p-6 shadow-2xl sm:rounded-3xl sm:p-8">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <XIcon className="size-5" />
            </button>

            {status === "success" ? (
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
                  onClick={close}
                  className="mt-2 rounded-full border border-border px-5 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="text-lg font-semibold">Ask anything, anonymously</h3>
                <p className="mt-1 text-sm text-muted">
                  No account needed. Nobody will know it was you.
                </p>

                <div className="mt-4">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
                    maxLength={MAX_LENGTH}
                    rows={5}
                    placeholder="What do you want to ask?"
                    disabled={status === "submitting"}
                    className="w-full resize-none rounded-2xl border border-border bg-background/60 p-4 text-sm text-foreground placeholder:text-muted focus:border-accent-a/60 focus:outline-none focus:ring-2 focus:ring-accent-a/20"
                  />
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className={error ? "text-danger" : "invisible"}>{error}</span>
                    <span className={remaining < 100 ? "text-danger" : "text-muted"}>
                      {remaining}
                    </span>
                  </div>
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
            )}
          </div>
        </div>
      )}
    </>
  );
}
