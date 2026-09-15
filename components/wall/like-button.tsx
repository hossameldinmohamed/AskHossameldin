"use client";

import { useState } from "react";

import { HeartIcon } from "@/components/icons";

interface LikeButtonProps {
  questionId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ questionId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);

    // Optimistic update, rolled back if the request fails.
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/questions/${questionId}/like`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.likeCount);
    } catch {
      setLiked(!nextLiked);
      setCount((c) => c + (nextLiked ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        liked ? "text-accent-b" : "text-muted hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      <HeartIcon className="size-3.5" fill={liked ? "currentColor" : "none"} />
      {count > 0 ? count : "Like"}
    </button>
  );
}
