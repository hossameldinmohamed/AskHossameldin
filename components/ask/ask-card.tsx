import { AskForm } from "@/components/ask/ask-form";

/**
 * Always-visible compose box at the top of the wall, instead of a
 * floating corner button a visitor has to notice and click first.
 */
export function AskCard() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-6 sm:px-6">
      <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-base font-semibold">Got a question?</h2>
        <p className="mt-1 text-sm text-muted">Whatever&apos;s on your mind — go ahead and ask.</p>
        <div className="mt-4">
          <AskForm />
        </div>
      </div>
    </div>
  );
}
