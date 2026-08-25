import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { YearSelector } from "@/components/client/year-selector";
import { listAllPublishedPeriods, monthName } from "@/lib/reports";
import type { Database } from "@/types/database";

/*
Shared rendering for the "Reports" section of the client portal — the
monthly report tabs, year selector, and report iframe. Used by both the
client-facing /dashboard/reports page and the admin's read-only preview at
/admin/clients/[clientId]/portal/reports, so the two always show the exact
same thing.
*/
export async function ReportsPortalView({
  supabase,
  clientId,
  basePath,
  year,
  period,
}: {
  supabase: SupabaseClient<Database>;
  clientId: string;
  basePath: string;
  year?: string;
  period?: string;
}) {
  const periods = await listAllPublishedPeriods(supabase, clientId);

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
                      : "border border-slate-300 bg-white text-slate-700 hover:border-teal-300"
                  }`}
                >
                  {monthName(p.period_month)}
                </Link>
              ))}
            </div>

            <YearSelector years={years} selectedYear={selectedYear} basePath={basePath} />
          </div>

          <iframe
            key={selectedPeriod.id}
            src={`/api/reports/${selectedPeriod.id}/file`}
            title={`${monthName(selectedPeriod.period_month)} ${selectedPeriod.period_year} report`}
            className="block h-[calc(100vh-6.5rem)] min-h-[900px] w-full border-0 bg-transparent"
            sandbox="allow-scripts allow-downloads allow-popups"
            referrerPolicy="no-referrer"
          />
        </>
      )}
    </div>
  );
}
