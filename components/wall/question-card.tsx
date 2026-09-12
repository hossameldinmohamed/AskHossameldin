import { FollowUpButton } from "@/components/wall/follow-up-button";
import { RichAnswer } from "@/components/wall/rich-answer";
import { ShareButton } from "@/components/wall/share-button";
import { formatAbsoluteTime, formatRelativeTime } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import type { PublicQuestion } from "@/lib/types";

function QuestionBlock({ item }: { item: PublicQuestion }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-muted"
        aria-hidden="true"
      >
        ?
      </span>
      <p dir="auto" className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/95">
        {item.content}
      </p>
    </div>
  );
}

function AnswerBlock({ item, isRoot }: { item: PublicQuestion; isRoot: boolean }) {
  if (!item.answer) return null;

  const shareText = `Q: ${item.content}\n\nA: ${item.answer}`.slice(0, 500);

  return (
    <div className={isRoot ? "mt-4 border-t border-border pt-4" : "mt-3 border-t border-border pt-3"}>
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-black"
          title={siteConfig.name}
          aria-label={siteConfig.name}
        >
          {siteConfig.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p dir="auto" className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
            {item.answer}
          </p>

          <RichAnswer text={item.answer} />

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
      <QuestionBlock item={item} />
      <AnswerBlock item={item} isRoot={isRoot} />

      {item.followUps && item.followUps.length > 0 && (
        <div className="mt-5 flex flex-col gap-5 border-l-2 border-accent-b/25 pl-4">
          {item.followUps.map((followUp) => (
            <div key={followUp.id}>
              <QuestionBlock item={followUp} />
              <AnswerBlock item={followUp} isRoot={false} />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
