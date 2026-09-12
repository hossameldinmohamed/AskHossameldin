import { FollowUpButton } from "@/components/wall/follow-up-button";
import { ShareButton } from "@/components/wall/share-button";
import { formatAbsoluteTime, formatRelativeTime } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import type { PublicQuestion } from "@/lib/types";

function AnswerBlock({ item, isRoot }: { item: PublicQuestion; isRoot: boolean }) {
  if (!item.answer) return null;

  const shareText = `Q: ${item.content}\n\nA: ${item.answer}`.slice(0, 500);

  return (
    <div className={isRoot ? "mt-4 border-t border-border pt-4" : "mt-3 border-t border-border pt-3"}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-muted">
          A
        </span>
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
            {item.answer}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            {item.answeredAt && (
              <p className="text-xs text-muted" title={formatAbsoluteTime(item.answeredAt)}>
                {formatRelativeTime(item.answeredAt)}
              </p>
            )}
            <div className="-mr-2 flex items-center gap-1">
              <ShareButton
                path={`/q/${item.id}`}
                title={`${siteConfig.title}: ${item.content}`}
                text={shareText}
              />
              {isRoot && <FollowUpButton questionId={item.id} questionContent={item.content} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuestionCard({
  item,
  index,
  isRoot = true,
}: {
  item: PublicQuestion;
  index: number;
  isRoot?: boolean;
}) {
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

      <AnswerBlock item={item} isRoot={isRoot} />

      {item.followUps && item.followUps.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 border-t border-dashed border-border pt-4 pl-4">
          {item.followUps.map((followUp) => (
            <div key={followUp.id} className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-[10px] font-bold text-black">
                  Q
                </span>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/95">
                  {followUp.content}
                </p>
              </div>
              <AnswerBlock item={followUp} isRoot={false} />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
