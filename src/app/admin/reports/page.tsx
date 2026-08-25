import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectField } from "@/components/ui/field";
import { FlashMessage } from "@/components/shared/flash-message";
import { requireAdmin } from "@/lib/auth/guards";
import { monthName } from "@/lib/reports";
import {
  deleteReportAction,
  setPeriodPublishedAction,
  uploadReportAction,
} from "@/features/admin/reports-actions";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

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

  const currentYear = new Date().getFullYear();

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
            <form
              action={uploadReportAction}
              encType="multipart/form-data"
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <input type="hidden" name="clientId" value={clientId} />
              <SelectField label="Month" name="periodMonth" defaultValue={new Date().getMonth() + 1}>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {monthName(m)}
                  </option>
                ))}
              </SelectField>
              <Field
                label="Year"
                name="periodYear"
                type="number"
                defaultValue={currentYear}
                required
              />
              <div className="sm:col-span-2">
                <label className="grid gap-2 text-base font-semibold text-slate-700">
                  Report file (.html)
                  <input
                    type="file"
                    name="file"
                    accept=".html,text/html"
                    required
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 shadow-sm"
                  />
                </label>
              </div>
              <label className="flex items-center gap-3 text-base font-semibold text-slate-700 sm:col-span-2">
                <input type="checkbox" name="published" className="h-5 w-5" />
                Publish now (visible to the client immediately)
              </label>
              <div className="sm:col-span-2">
                <Button type="submit">Save or replace report</Button>
              </div>
            </form>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        period.published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {period.published ? "Published" : "Draft"}
                    </span>

                    <form action={setPeriodPublishedAction}>
                      <input type="hidden" name="periodId" value={period.id} />
                      <input type="hidden" name="clientId" value={clientId} />
                      <input
                        type="hidden"
                        name="published"
                        value={period.published ? "false" : "true"}
                      />
                      {period.published ? (
                        <ConfirmSubmitButton
                          variant="secondary"
                          message={`Unpublish ${monthName(period.period_month)} ${period.period_year}? It will immediately disappear from the client portal.`}
                        >
                          Unpublish
                        </ConfirmSubmitButton>
                      ) : (
                        <Button type="submit" variant="secondary">
                          Publish
                        </Button>
                      )}
                    </form>

                    <form action={deleteReportAction}>
                      <input type="hidden" name="periodId" value={period.id} />
                      <input type="hidden" name="clientId" value={clientId} />
                      <ConfirmSubmitButton message={`Permanently delete ${monthName(period.period_month)} ${period.period_year}? This removes both the report record and its stored file.`}>
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
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
