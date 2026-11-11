import { OverviewPortalView } from "@/components/client/overview-portal-view";
import { FlashMessage } from "@/components/shared/flash-message";
import { requireClientUser } from "@/lib/auth/guards";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const context = await requireClientUser();
  const params = await searchParams;

  return (
    <div>
      <FlashMessage success={params.success} error={params.error} />
      <OverviewPortalView
        supabase={context.supabase}
        clientId={context.client.id}
        basePath="/dashboard"
      />
    </div>
  );
}
