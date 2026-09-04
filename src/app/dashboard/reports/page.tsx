import { ReportsPortalView } from "@/components/client/reports-portal-view";
import { FlashMessage } from "@/components/shared/flash-message";
import { requireClientUser } from "@/lib/auth/guards";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    period?: string;
    success?: string;
    error?: string;
  }>;
}) {
  const context = await requireClientUser();
  const params = await searchParams;

  return (
    <div>
      <FlashMessage success={params.success} error={params.error} />
      <ReportsPortalView
        supabase={context.supabase}
        clientId={context.client.id}
        basePath="/dashboard"
        year={params.year}
        period={params.period}
      />
    </div>
  );
}
