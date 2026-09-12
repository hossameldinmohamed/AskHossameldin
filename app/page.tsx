import { desc, eq } from "drizzle-orm";

import { AskWidget } from "@/components/ask/ask-widget";
import { Hero } from "@/components/hero";
import { Wall } from "@/components/wall/wall";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";

const PAGE_SIZE = 12;

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = await db
    .select({
      id: questions.id,
      content: questions.content,
      answer: questions.answer,
      answeredAt: questions.answeredAt,
    })
    .from(questions)
    .where(eq(questions.status, "answered"))
    .orderBy(desc(questions.answeredAt))
    .limit(PAGE_SIZE + 1);

  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE);
  const nextCursor = hasMore ? items[items.length - 1]?.answeredAt?.toISOString() ?? null : null;

  const serialized = items.map((item) => ({
    ...item,
    answeredAt: item.answeredAt ? item.answeredAt.toISOString() : null,
  }));

  return (
    <>
      <Hero />
      <Wall initialItems={serialized} initialCursor={nextCursor} />
      <AskWidget />
    </>
  );
}
