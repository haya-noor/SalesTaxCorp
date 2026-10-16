import { ReportsPortalView } from "@/components/client/reports-portal-view";
import { FlashMessage } from "@/components/shared/flash-message";
import { requireAdminClientView } from "@/lib/auth/guards";

export default async function ClientPortalPreviewReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{
    year?: string;
    month?: string;
    period?: string;
    success?: string;
    error?: string;
  }>;
}) {
  const { clientId } = await params;
  const { supabase, client } = await requireAdminClientView(clientId);
  const query = await searchParams;

  return (
    <div className="grid gap-4">
      <FlashMessage {...query} />

      <ReportsPortalView
        supabase={supabase}
        clientId={client.id}
        basePath={`/client-portal/${clientId}`}
        year={query.year}
        month={query.month}
        period={query.period}
        adminMode
      />
    </div>
  );
}
