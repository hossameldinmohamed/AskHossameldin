import { headers } from "next/headers";
import { after } from "next/server";

import { AskCard } from "@/components/ask/ask-card";
import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { Wall } from "@/components/wall/wall";
import { isAdminRequest } from "@/lib/auth/require-admin";
import { recordPageView } from "@/lib/queries/analytics";
import { getAnsweredCount, getWallPage } from "@/lib/queries/wall";
import { getClientIp, hashIp } from "@/lib/security/ip";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [isAdmin, requestHeaders] = await Promise.all([isAdminRequest(), headers()]);
  const viewerIpHash = await hashIp(getClientIp(requestHeaders));

  const [page, totalCount] = await Promise.all([
    getWallPage(null, viewerIpHash),
    getAnsweredCount(),
  ]);

  // Don't count the admin's own visits, and don't block the response on
  // recording the view - it runs after the page has already been sent.
  if (!isAdmin) {
    after(() => recordPageView(viewerIpHash));
  }

  return (
    <>
      <Hero answeredCount={totalCount} />
      <AskCard />
      <Wall initialItems={page.items} initialCursor={page.nextCursor} />
      <SiteFooter />
    </>
  );
}
