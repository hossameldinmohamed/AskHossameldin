import { AskWidget } from "@/components/ask/ask-widget";
import { Hero } from "@/components/hero";
import { Wall } from "@/components/wall/wall";
import { getAnsweredCount, getWallPage } from "@/lib/queries/wall";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [page, totalCount] = await Promise.all([getWallPage(null), getAnsweredCount()]);

  return (
    <>
      <Hero answeredCount={totalCount} />
      <Wall initialItems={page.items} initialCursor={page.nextCursor} />
      {page.items.length > 0 && <AskWidget />}
    </>
  );
}
