"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LockIcon, SpinnerIcon } from "@/components/icons";
import { siteConfig } from "@/lib/site";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in-up rounded-3xl border border-border bg-surface p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-brand text-black">
            <LockIcon className="size-6" />
          </div>
          <h1 className="mt-4 text-xl font-semibold">{siteConfig.title} admin</h1>
          <p className="mt-1 text-sm text-muted">Enter the admin password to moderate questions.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm focus:border-accent-a/60 focus:outline-none focus:ring-2 focus:ring-accent-a/20"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="mt-1 flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 font-medium text-black transition-opacity disabled:opacity-40"
          >
            {loading && <SpinnerIcon className="size-4 animate-spin-slow" />}
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
