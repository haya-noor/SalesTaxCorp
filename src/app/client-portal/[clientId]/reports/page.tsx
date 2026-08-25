import { ReportsPortalView } from "@/components/client/reports-portal-view";
import { requireAdminClientView } from "@/lib/auth/guards";

export default async function ClientPortalPreviewReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ year?: string; period?: string }>;
}) {
  const { clientId } = await params;
  const { supabase, client } = await requireAdminClientView(clientId);
  const query = await searchParams;

  return (
    <ReportsPortalView
      supabase={supabase}
      clientId={client.id}
      basePath={`/client-portal/${clientId}`}
      year={query.year}
      period={query.period}
    />
  );
}
