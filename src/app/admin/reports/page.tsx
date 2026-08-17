import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectField } from "@/components/ui/field";
import { FlashMessage } from "@/components/shared/flash-message";
import { requireAdmin } from "@/lib/auth/guards";
import { monthName } from "@/lib/reports";
import {
  setPeriodPublishedAction,
  uploadReportAction,
} from "@/features/admin/reports-actions";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; store?: string; success?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("company_name");

  const clientId = params.client ?? clients?.[0]?.id;

  const { data: stores } = clientId
    ? await supabase
        .from("stores")
        .select("*")
        .eq("client_id", clientId)
        .order("display_name")
    : { data: null };

  const storeId = params.store ?? stores?.[0]?.id;

  const { data: periods } = storeId
    ? await supabase
        .from("filing_periods")
        .select("*")
        .eq("store_id", storeId)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false })
    : { data: null };

  const currentYear = new Date().getFullYear();

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        description="Upload the generated monthly report for a store and publish it once reviewed."
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
          <div className="min-w-64 flex-1">
            <SelectField label="Store" name="store" defaultValue={storeId}>
              {stores?.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.display_name}
                </option>
              ))}
            </SelectField>
          </div>
          <Button type="submit" variant="secondary">
            Switch
          </Button>
        </form>
      </Card>

      {storeId ? (
        <>
          <Card className="mt-6">
            <h2 className="text-xl font-bold">Upload report</h2>
            <p className="mt-1 text-base text-slate-500">
              Upload the standalone report file generated for this month.
              Leave &quot;Publish now&quot; unchecked to save it as a draft for review first.
            </p>
            <form
              action={uploadReportAction}
              encType="multipart/form-data"
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <input type="hidden" name="storeId" value={storeId} />
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
                <Button type="submit">Save report</Button>
              </div>
            </form>
          </Card>

          <Card className="mt-6">
            <h2 className="text-xl font-bold">Reports for this store</h2>
            <div className="mt-4 divide-y divide-slate-200">
              {periods?.map((period) => (
                <div
                  key={period.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-slate-950">
                      {monthName(period.period_month)} {period.period_year}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {period.published ? "Published" : "Draft"}
                    </p>
                  </div>
                  <form action={setPeriodPublishedAction}>
                    <input type="hidden" name="periodId" value={period.id} />
                    <input type="hidden" name="storeId" value={storeId} />
                    <input
                      type="hidden"
                      name="published"
                      value={period.published ? "false" : "true"}
                    />
                    <Button type="submit" variant="secondary">
                      {period.published ? "Unpublish" : "Publish"}
                    </Button>
                  </form>
                </div>
              ))}

              {!periods?.length ? (
                <p className="py-8 text-center text-base text-slate-500">
                  No reports uploaded yet for this store.
                </p>
              ) : null}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
