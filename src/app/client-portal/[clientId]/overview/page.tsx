import { OverviewPortalView } from "@/components/client/overview-portal-view";
import { requireAdminClientView } from "@/lib/auth/guards";

export default async function ClientPortalPreviewOverviewPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const { supabase, client } = await requireAdminClientView(clientId);

  return (
    <OverviewPortalView
      supabase={supabase}
      clientId={client.id}
      companyName={client.company_name}
      basePath={`/client-portal/${clientId}`}
      adminMode
    />
  );
}
