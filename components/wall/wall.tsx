"use client";

import { useState } from "react";

import { ArrowDownIcon, SparkleIcon, SpinnerIcon } from "@/components/icons";
import type { PublicQuestion } from "@/lib/types";

import { QuestionCard } from "./question-card";

interface WallProps {
  initialItems: PublicQuestion[];
  initialCursor: string | null;
}

export function Wall({ initialItems, initialCursor }: WallProps) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/questions?cursor=${encodeURIComponent(cursor)}`);
      if (!res.ok) throw new Error("Failed to load more questions.");
      const data = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch {
      setError("Couldn't load more questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 px-6 pb-24 text-center">
        <SparkleIcon className="size-7 text-accent-b" />
        <h2 className="text-lg font-semibold">Be the first to ask</h2>
        <p className="text-sm text-muted">Ask above, and it&apos;ll show up here as soon as it&apos;s answered.</p>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-32 sm:px-6">
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <QuestionCard key={item.id} item={item} index={i} />
        ))}
      </div>

      {error && <p className="mt-4 text-center text-sm text-danger">{error}</p>}

      {cursor && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-50"
          >
            {loading ? (
              <SpinnerIcon className="size-4 animate-spin-slow" />
            ) : (
              <ArrowDownIcon className="size-4" />
            )}
            Load more
          </button>
        </div>
      )}
    </section>
  );
}
