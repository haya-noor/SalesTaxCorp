import { ReportsPortalView } from "@/components/client/reports-portal-view";
import { requireClientUser } from "@/lib/auth/guards";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; period?: string }>;
}) {
  const context = await requireClientUser();
  const params = await searchParams;

  return (
    <ReportsPortalView
      supabase={context.supabase}
      clientId={context.client.id}
      basePath="/dashboard"
      year={params.year}
      period={params.period}
    />
  );
}
