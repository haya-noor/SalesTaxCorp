import { AdminReportUploadForm } from "@/components/admin/admin-report-upload-form";
import { ReportsPortalView } from "@/components/client/reports-portal-view";
import { FlashMessage } from "@/components/shared/flash-message";
import { Card } from "@/components/ui/card";
import { requireAdminClientView } from "@/lib/auth/guards";

export default async function ClientPortalPreviewReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{
    year?: string;
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

      <Card
        id="manage-report"
        className="scroll-mt-28 border-amber-200 bg-amber-50/60"
      >
        <details open>
          <summary className="cursor-pointer text-lg font-bold text-slate-950">
            Upload or replace a report
          </summary>
          <p className="mt-2 text-base text-slate-600">
            Uploading the same month and year replaces its stored file and
            resets client approval to pending. Leave Publish now unchecked to
            review it here as a draft first.
          </p>
          <AdminReportUploadForm
            clientId={client.id}
            workspace="client-portal"
          />
        </details>
      </Card>

      <ReportsPortalView
        supabase={supabase}
        clientId={client.id}
        basePath={`/client-portal/${clientId}`}
        year={query.year}
        period={query.period}
        adminMode
      />
    </div>
  );
}
