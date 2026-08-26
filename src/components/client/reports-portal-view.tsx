import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminReportActions } from "@/components/admin/admin-report-actions";
import { Card } from "@/components/ui/card";
import { ReportFrame } from "@/components/client/report-frame";
import { YearSelector } from "@/components/client/year-selector";
import {
  listAllClientPeriods,
  listAllPublishedPeriods,
  monthName,
} from "@/lib/reports";
import type { Database } from "@/types/database";

/*
Shared rendering for the "Reports" section of the client portal — the
monthly report tabs, year selector, and report iframe. Used by both the
client-facing /dashboard/reports page and the admin's management workspace at
/admin/clients/[clientId]/portal/reports, so the two always show the exact
same thing.
*/
export async function ReportsPortalView({
  supabase,
  clientId,
  basePath,
  year,
  period,
  adminMode = false,
}: {
  supabase: SupabaseClient<Database>;
  clientId: string;
  basePath: string;
  year?: string;
  period?: string;
  adminMode?: boolean;
}) {
  const periods = adminMode
    ? await listAllClientPeriods(supabase, clientId)
    : await listAllPublishedPeriods(supabase, clientId);

  const years = Array.from(new Set(periods.map((p) => p.period_year))).sort(
    (a, b) => b - a,
  );
  const requestedYear = year ? Number(year) : undefined;
  const selectedYear =
    requestedYear && years.includes(requestedYear) ? requestedYear : years[0];

  const yearPeriods = periods.filter((p) => p.period_year === selectedYear);
  const selectedPeriod =
    (period ? yearPeriods.find((p) => p.id === period) : undefined) ??
    yearPeriods[yearPeriods.length - 1];

  function periodHref(p: { id: string; period_year: number }) {
    return `${basePath}/reports?year=${p.period_year}&period=${p.id}`;
  }

  return (
    <div className="flex flex-col gap-2">
      {!selectedPeriod ? (
        <Card className="py-14 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-xl text-teal-700">
            ≡
          </div>
          <h2 className="mt-5 text-xl font-bold">No reports are currently available</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Reports will appear here once a monthly report has been published.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex min-h-10 flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
              {yearPeriods.map((p) => (
                <Link
                  key={p.id}
                  href={periodHref(p)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    p.id === selectedPeriod.id
                      ? "bg-teal-700 text-white shadow-sm"
                      : adminMode && !p.published
                        ? "border border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-teal-300"
                  }`}
                >
                  {monthName(p.period_month)}
                  {adminMode && !p.published ? " · Draft" : ""}
                </Link>
              ))}
            </div>

            <YearSelector years={years} selectedYear={selectedYear} basePath={basePath} />
          </div>

          {adminMode ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-amber-800">
                  Administrator controls
                </p>
                <p className="mt-1 text-sm text-amber-900">
                  Managing {monthName(selectedPeriod.period_month)} {selectedPeriod.period_year}.
                </p>
              </div>
              <AdminReportActions
                clientId={clientId}
                period={selectedPeriod}
                workspace="client-portal"
                replaceHref="#manage-report"
              />
            </div>
          ) : null}

          <ReportFrame
            key={selectedPeriod.id}
            periodId={selectedPeriod.id}
            title={`${monthName(selectedPeriod.period_month)} ${selectedPeriod.period_year} report`}
          />
        </>
      )}
    </div>
  );
}
