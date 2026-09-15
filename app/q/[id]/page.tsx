import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { QuestionCard } from "@/components/wall/question-card";
import { getQuestionById } from "@/lib/queries/wall";
import { getClientIp, hashIp } from "@/lib/security/ip";

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
  const viewerIpHash = await hashIp(getClientIp(await headers()));
  const question = await getQuestionById(id, viewerIpHash);

  if (!question) notFound();

  return (
    <main className="min-h-screen pb-10">
      <SiteHeader />

      <div className="mx-auto mt-6 w-full max-w-2xl px-4 sm:px-6">
        {question.parent && (
          <p dir="auto" className="mb-4 text-xs text-muted">
            In reply to{" "}
            <Link href={`/q/${question.parent.id}`} className="underline hover:text-foreground">
              &ldquo;{truncate(question.parent.content, 80)}&rdquo;
            </Link>
          </p>
        )}

        <QuestionCard item={question} index={0} isRoot={!question.parent} />
      </div>

      <SiteFooter />
    </main>
  );
}
