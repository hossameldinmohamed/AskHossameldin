import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminQuestions } from "@/lib/queries/admin";
import { getAnalyticsSummary } from "@/lib/queries/analytics";
import { getPendingCount } from "@/lib/queries/wall";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [pendingPage, analytics, pendingCount] = await Promise.all([
    getAdminQuestions("pending", null),
    getAnalyticsSummary(),
    getPendingCount(),
  ]);

  return (
    <AdminDashboard
      initialPending={pendingPage.items}
      initialPendingCursor={pendingPage.nextCursor}
      pendingCount={pendingCount}
      analytics={analytics}
    />
  );
}
