"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { HistoryItem } from "@/components/admin/history-item";
import { PendingItem } from "@/components/admin/pending-item";
import { ArrowDownIcon, LinkIcon, SpinnerIcon } from "@/components/icons";
import type { AnalyticsSummary } from "@/lib/queries/analytics";
import type { AdminQuestion, QuestionStatus } from "@/lib/types";

const TABS: { key: QuestionStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "answered", label: "Answered" },
  { key: "rejected", label: "Rejected" },
];

// How often to check for newly-arrived questions without a manual reload.
const POLL_INTERVAL_MS = 2 * 60 * 1000;

interface TabState {
  items: AdminQuestion[];
  cursor: string | null;
}

function AnalyticsBar({ analytics }: { analytics: AnalyticsSummary }) {
  const stats = [
    { label: "Visitors today", value: analytics.todayUnique },
    { label: "Views today", value: analytics.todayViews },
    { label: "Visitors all-time", value: analytics.totalUnique },
    { label: "Views all-time", value: analytics.totalViews },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-center">
          <p className="text-lg font-semibold text-gradient">{stat.value}</p>
          <p className="text-[11px] text-muted">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard({
  initialPending,
  initialPendingCursor,
  pendingCount,
  analytics,
}: {
  initialPending: AdminQuestion[];
  initialPendingCursor: string | null;
  pendingCount: number;
  analytics: AnalyticsSummary;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<QuestionStatus>("pending");
  const [cache, setCache] = useState<Record<QuestionStatus, TabState | null>>({
    pending: { items: initialPending, cursor: initialPendingCursor },
    answered: null,
    rejected: null,
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pendingCountState, setPendingCountState] = useState(pendingCount);
  const activeTabRef = useRef(activeTab);
  const pendingCountRef = useRef(pendingCount);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    pendingCountRef.current = pendingCountState;
  }, [pendingCountState]);

  // Periodically check for newly-arrived pending questions so you don't
  // have to keep manually reloading the page to notice them.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const countRes = await fetch("/api/admin/pending-count");
        if (!countRes.ok) return;
        const { count } = await countRes.json();
        if (count === pendingCountRef.current) return;

        setPendingCountState(count);
        if (activeTabRef.current !== "pending") return;

        const listRes = await fetch("/api/admin/questions?status=pending");
        if (!listRes.ok) return;
        const data = await listRes.json();
        setCache((prev) => ({ ...prev, pending: { items: data.items, cursor: data.nextCursor } }));
      } catch {
        // Background convenience poll - silently retry next tick.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  async function selectTab(tab: QuestionStatus) {
    setActiveTab(tab);
    if (cache[tab] !== null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions?status=${tab}`);
      if (res.ok) {
        const data = await res.json();
        setCache((prev) => ({ ...prev, [tab]: { items: data.items, cursor: data.nextCursor } }));
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    const current = cache[activeTab];
    if (!current?.cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/admin/questions?status=${activeTab}&cursor=${encodeURIComponent(current.cursor)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setCache((prev) => ({
          ...prev,
          [activeTab]: { items: [...current.items, ...data.items], cursor: data.nextCursor },
        }));
      }
    } finally {
      setLoadingMore(false);
    }
  }

  function handleAnswered(item: AdminQuestion) {
    setPendingCountState((n) => Math.max(0, n - 1));
    setCache((prev) => ({
      ...prev,
      pending: prev.pending
        ? { ...prev.pending, items: prev.pending.items.filter((q) => q.id !== item.id) }
        : prev.pending,
      answered: prev.answered ? { ...prev.answered, items: [item, ...prev.answered.items] } : prev.answered,
    }));
  }

  function handleRejected(id: string) {
    setPendingCountState((n) => Math.max(0, n - 1));
    setCache((prev) => {
      const rejectedItem = prev.pending?.items.find((q) => q.id === id);
      return {
        ...prev,
        pending: prev.pending
          ? { ...prev.pending, items: prev.pending.items.filter((q) => q.id !== id) }
          : prev.pending,
        rejected:
          prev.rejected && rejectedItem
            ? { ...prev.rejected, items: [{ ...rejectedItem, status: "rejected" as const }, ...prev.rejected.items] }
            : prev.rejected,
      };
    });
  }

  function handleDeleted(tab: QuestionStatus, id: string) {
    setCache((prev) => {
      const tabState = prev[tab];
      if (!tabState) return prev;
      return { ...prev, [tab]: { ...tabState, items: tabState.items.filter((q) => q.id !== id) } };
    });
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const tabState = cache[activeTab];
  const items = tabState?.items ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Moderation</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <LinkIcon className="size-3.5" />
            View wall
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            Log out
          </button>
        </div>
      </div>

      <AnalyticsBar analytics={analytics} />

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
            {tab.key === "pending" && pendingCountState > 0 && (
              <span className="ml-1.5">({pendingCountState})</span>
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

        {!loading && tabState?.cursor && (
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-hover disabled:opacity-50"
            >
              {loadingMore ? (
                <SpinnerIcon className="size-4 animate-spin-slow" />
              ) : (
                <ArrowDownIcon className="size-4" />
              )}
              Load more
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
