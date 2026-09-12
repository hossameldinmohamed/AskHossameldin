import { formatRelativeTime } from "@/lib/format";
import type { PublicQuestion } from "@/lib/types";

export function QuestionCard({ item, index }: { item: PublicQuestion; index: number }) {
  return (
    <article
      className="animate-fade-in-up rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-surface-hover sm:p-6"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-black">
          Q
        </span>
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/95">
          {item.content}
        </p>
      </div>

      {item.answer && (
        <div className="mt-4 flex items-start gap-3 border-t border-border pt-4">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-muted">
            A
          </span>
          <div className="min-w-0 flex-1">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
              {item.answer}
            </p>
            {item.answeredAt && (
              <p className="mt-2 text-xs text-muted">{formatRelativeTime(item.answeredAt)}</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
