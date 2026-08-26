import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminReportActions } from "@/components/admin/admin-report-actions";
import { AdminReportUploadForm } from "@/components/admin/admin-report-upload-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/field";
import { FlashMessage } from "@/components/shared/flash-message";
import { requireAdmin } from "@/lib/auth/guards";
import { monthName } from "@/lib/reports";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; success?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("status", "active")
    .order("company_name");

  const clientId = params.client ?? clients?.[0]?.id;

  const { data: periods } = clientId
    ? await supabase
        .from("filing_periods")
        .select("*")
        .eq("client_id", clientId)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false })
    : { data: null };

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        description="Upload the generated monthly report for a client and publish it once reviewed."
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Reports" }]}
      />

      <FlashMessage {...params} />

      <Card>
        <form className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <SelectField label="Client" name="client" defaultValue={clientId}>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name}
                </option>
              ))}
            </SelectField>
          </div>
          <Button type="submit" variant="secondary">
            Switch
          </Button>
        </form>
      </Card>

      {clientId ? (
        <>
          <Card id="upload-report" className="mt-6 scroll-mt-28">
            <h2 className="text-xl font-bold">Upload report</h2>
            <p className="mt-1 text-base text-slate-500">
              Upload the standalone report file generated for this month.
              Uploading the same client, month, and year replaces the existing file.
              Leave &quot;Publish now&quot; unchecked to save it as a draft for review first.
            </p>
            <AdminReportUploadForm clientId={clientId} />
          </Card>

          <Card className="mt-6">
            <h2 className="text-xl font-bold">Report history</h2>
            <div className="mt-4 divide-y divide-slate-200">
              {periods?.map((period) => (
                <div
                  key={period.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <span className="font-semibold text-slate-900">
                    {monthName(period.period_month)} {period.period_year}
                  </span>
                  <AdminReportActions clientId={clientId} period={period} />
                </div>
              ))}
              {!periods?.length ? (
                <p className="py-6 text-center text-base text-slate-500">
                  No reports uploaded yet for this client.
                </p>
              ) : null}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
