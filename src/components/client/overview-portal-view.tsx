import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ReportApprovalStatus } from "@/components/client/report-approval-status";
import { ReportFrame } from "@/components/client/report-frame";
import { Card } from "@/components/ui/card";
import { listAllPublishedPeriods, monthName } from "@/lib/reports";
import type { Database } from "@/types/database";

/*
Default landing tab of the client portal. Opens the current month's
published report straight away. Reports are usually published after a month
closes, so when this month's report isn't out yet it falls back to the most
recent published one and says so. Administrators see exactly what the client
sees (published reports only), without the approve button.
*/
export async function OverviewPortalView({
  supabase,
  clientId,
  basePath,
  adminMode = false,
}: {
  supabase: SupabaseClient<Database>;
  clientId: string;
  basePath: string;
  adminMode?: boolean;
}) {
  const periods = await listAllPublishedPeriods(supabase, clientId);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const currentPeriod = periods.find(
    (candidate) =>
      candidate.period_year === currentYear &&
      candidate.period_month === currentMonth,
  );
  // listAllPublishedPeriods is ordered oldest first, so the last entry is the latest.
  const period = currentPeriod ?? periods.at(-1);
  const isCurrent = Boolean(currentPeriod);

  return (
    <div className="client-report-surface flex flex-col gap-2 lg:-m-8 lg:min-h-full lg:gap-0">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900 sm:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-slate-100">
            {period
              ? `${monthName(period.period_month)} ${period.period_year} report`
              : "Your monthly report"}
          </h1>
          <p className="mt-1 text-base text-slate-600 dark:text-slate-300">
            {!period
              ? "Your current month's report will appear here once it has been published."
              : isCurrent
                ? "This month's sales tax report."
                : `${monthName(currentMonth)}'s report isn't published yet, so this is your most recent one.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {period && !adminMode ? (
            <ReportApprovalStatus period={period} returnTo="overview" />
          ) : null}
          {period && adminMode ? (
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                period.client_approved_at
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-200"
              }`}
            >
              {period.client_approved_at ? "Approved by client" : "Pending client approval"}
            </span>
          ) : null}
          <Link
            href={`${basePath}/reports`}
            className="inline-flex min-h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-teal-500 dark:hover:text-teal-300"
          >
            All reports &rarr;
          </Link>
        </div>
      </div>

      {period ? (
        <ReportFrame
          key={period.id}
          periodId={period.id}
          title={`${monthName(period.period_month)} ${period.period_year} report`}
        />
      ) : (
        <Card className="py-14 text-center lg:m-8">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-xl text-teal-700 dark:bg-teal-950/70 dark:text-teal-300">
            ≡
          </div>
          <h2 className="mt-5 text-xl font-bold">No report published yet</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            We&apos;ll show your latest monthly report here as soon as it&apos;s ready.
          </p>
        </Card>
      )}
    </div>
  );
}
