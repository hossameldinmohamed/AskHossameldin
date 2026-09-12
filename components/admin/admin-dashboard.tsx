"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { HistoryItem } from "@/components/admin/history-item";
import { PendingItem } from "@/components/admin/pending-item";
import { SpinnerIcon } from "@/components/icons";
import type { AdminQuestion, QuestionStatus } from "@/lib/types";

const TABS: { key: QuestionStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "answered", label: "Answered" },
  { key: "rejected", label: "Rejected" },
];

export function AdminDashboard({ initialPending }: { initialPending: AdminQuestion[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<QuestionStatus>("pending");
  const [cache, setCache] = useState<Record<QuestionStatus, AdminQuestion[] | null>>({
    pending: initialPending,
    answered: null,
    rejected: null,
  });
  const [loading, setLoading] = useState(false);

  async function selectTab(tab: QuestionStatus) {
    setActiveTab(tab);
    if (cache[tab] !== null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions?status=${tab}`);
      if (res.ok) {
        const data = await res.json();
        setCache((prev) => ({ ...prev, [tab]: data.items }));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleAnswered(item: AdminQuestion) {
    setCache((prev) => ({
      ...prev,
      pending: (prev.pending ?? []).filter((q) => q.id !== item.id),
      answered: prev.answered ? [item, ...prev.answered] : prev.answered,
    }));
  }

  function handleRejected(id: string) {
    setCache((prev) => {
      const rejectedItem = prev.pending?.find((q) => q.id === id);
      return {
        ...prev,
        pending: (prev.pending ?? []).filter((q) => q.id !== id),
        rejected:
          prev.rejected && rejectedItem
            ? [{ ...rejectedItem, status: "rejected" as const }, ...prev.rejected]
            : prev.rejected,
      };
    });
  }

  function handleDeleted(tab: QuestionStatus, id: string) {
    setCache((prev) => ({ ...prev, [tab]: (prev[tab] ?? []).filter((q) => q.id !== id) }));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const items = cache[activeTab] ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Moderation</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          Log out
        </button>
      </div>

      <div className="mt-6 flex gap-1 rounded-full border border-border bg-surface p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => selectTab(tab.key)}
            className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key ? "bg-gradient-brand text-black" : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.key === "pending" && (cache.pending?.length ?? 0) > 0 && (
              <span className="ml-1.5">({cache.pending?.length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {loading && (
          <div className="flex justify-center py-10">
            <SpinnerIcon className="size-6 animate-spin-slow text-muted" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">Nothing here yet.</p>
        )}

        {!loading &&
          activeTab === "pending" &&
          items.map((item) => (
            <PendingItem key={item.id} item={item} onAnswered={handleAnswered} onRejected={handleRejected} />
          ))}

        {!loading &&
          activeTab !== "pending" &&
          items.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onDeleted={(id) => handleDeleted(activeTab, id)}
            />
          ))}
      </div>
    </main>
  );
}
