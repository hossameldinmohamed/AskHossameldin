import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { QuestionCard } from "@/components/wall/question-card";
import { getQuestionById } from "@/lib/queries/wall";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const question = await getQuestionById(id);

  if (!question) {
    return { title: "Question not found" };
  }

  const title = truncate(question.content, 90);
  const description = question.answer ? truncate(question.answer, 160) : undefined;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params;
  const question = await getQuestionById(id);

  if (!question) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
        ← Back to {siteConfig.title}
      </Link>

      {question.parent && (
        <p dir="auto" className="mt-4 text-xs text-muted">
          In reply to{" "}
          <Link href={`/q/${question.parent.id}`} className="underline hover:text-foreground">
            &ldquo;{truncate(question.parent.content, 80)}&rdquo;
          </Link>
        </p>
      )}

      <div className="mt-4">
        <QuestionCard item={question} index={0} isRoot={!question.parent} />
      </div>

      <SiteFooter />
    </main>
  );
}
