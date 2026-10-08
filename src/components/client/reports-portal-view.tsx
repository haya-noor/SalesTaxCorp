import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminReportActions } from "@/components/admin/admin-report-actions";
import { ReportApprovalStatus } from "@/components/client/report-approval-status";
import { ReportFrame } from "@/components/client/report-frame";
import { ReportLibraryFilters } from "@/components/client/report-library-filters";
import { Card } from "@/components/ui/card";
import {
  listAllClientPeriods,
  listAllPublishedPeriods,
  monthName,
} from "@/lib/reports";
import type { Database } from "@/types/database";

/*
Shared rendering for the Reports section of the client portal. The default
view is a filterable report library. Selecting a report opens its complete
standalone HTML dashboard in the secure report viewer. Administrators use
the same interface while retaining publishing and approval controls.
*/
export async function ReportsPortalView({
  supabase,
  clientId,
  basePath,
  year,
  month,
  period,
  adminMode = false,
}: {
  supabase: SupabaseClient<Database>;
  clientId: string;
  basePath: string;
  year?: string;
  month?: string;
  period?: string;
  adminMode?: boolean;
}) {
  const periods = adminMode
    ? await listAllClientPeriods(supabase, clientId)
    : await listAllPublishedPeriods(supabase, clientId);

  const years = Array.from(
    new Set(periods.map((candidate) => candidate.period_year)),
  ).sort((a, b) => b - a);
  const requestedPeriod = period
    ? periods.find((candidate) => candidate.id === period)
    : undefined;
  const requestedYear = year ? Number(year) : undefined;
  const selectedYear =
    requestedPeriod?.period_year ??
    (requestedYear && years.includes(requestedYear) ? requestedYear : years[0]);
  const requestedMonth = month ? Number(month) : undefined;
  const selectedMonth =
    requestedMonth &&
    Number.isInteger(requestedMonth) &&
    requestedMonth >= 1 &&
    requestedMonth <= 12
      ? String(requestedMonth)
      : "all";

  const visiblePeriods = periods
    .filter(
      (candidate) =>
        candidate.period_year === selectedYear &&
        (selectedMonth === "all" ||
          candidate.period_month === Number(selectedMonth)),
    )
    .sort((a, b) => b.period_month - a.period_month);

  function listHref() {
    const params = new URLSearchParams({ year: String(selectedYear) });
    if (selectedMonth !== "all") params.set("month", selectedMonth);
    return `${basePath}/reports?${params.toString()}`;
  }

  function periodHref(candidate: { id: string; period_year: number }) {
    const params = new URLSearchParams({
      year: String(candidate.period_year),
      period: candidate.id,
    });
    if (selectedMonth !== "all") params.set("month", selectedMonth);
    return `${basePath}/reports?${params.toString()}`;
  }

  function updatedLabel(updatedAt: string) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(updatedAt));
  }

  return (
    <div
      className={`client-report-surface flex flex-col gap-2 lg:min-h-full lg:gap-0 ${
        adminMode ? "" : "lg:-m-8"
      }`}
    >
      {!periods.length ? (
        <Card className={`py-14 text-center ${adminMode ? "" : "lg:m-8"}`}>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-xl text-teal-700">
            ≡
          </div>
          <h2 className="mt-5 text-xl font-bold">
            No reports are currently available
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Reports will appear here once a monthly report has been published.
          </p>
        </Card>
      ) : requestedPeriod ? (
        <>
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={listHref()}
                className="inline-flex min-h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
              >
                &larr; All reports
              </Link>
              <div>
                <p className="text-lg font-bold text-slate-950">
                  {monthName(requestedPeriod.period_month)}{" "}
                  {requestedPeriod.period_year}
                </p>
                <p className="text-sm text-slate-500">United States</p>
              </div>
            </div>

            {!adminMode ? (
              <ReportApprovalStatus period={requestedPeriod} />
            ) : null}
          </div>

          {adminMode ? (
            <div className="mx-5 mb-3 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-amber-800">
                  Administrator controls
                </p>
                <p className="mt-1 text-sm text-amber-900">
                  Managing {monthName(requestedPeriod.period_month)}{" "}
                  {requestedPeriod.period_year}.
                </p>
              </div>
              <AdminReportActions
                clientId={clientId}
                period={requestedPeriod}
                workspace="client-portal"
              />
            </div>
          ) : null}

          <ReportFrame
            key={requestedPeriod.id}
            periodId={requestedPeriod.id}
            title={`${monthName(requestedPeriod.period_month)} ${requestedPeriod.period_year} report`}
          />
        </>
      ) : (
        <div className="flex min-h-[calc(100vh-5rem)] flex-1 flex-col bg-[#f3f1ec]">
          <div className="border-b border-stone-200 bg-white px-5 py-5 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              Client portal
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Reports</h1>
            <p className="mt-1 text-base text-slate-600">
              Review your available monthly sales tax reports.
            </p>
          </div>

          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <ReportLibraryFilters
              years={years}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              reportCount={visiblePeriods.length}
              basePath={basePath}
            />

            {visiblePeriods.length ? (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(285px,1fr))]">
              {visiblePeriods.map((candidate) => {
                const approved = Boolean(candidate.client_approved_at);
                const statusLabel = adminMode
                  ? candidate.published
                    ? "Published"
                    : "Draft"
                  : approved
                    ? "Approved"
                    : "Pending approval";

                return (
                  <article
                    key={candidate.id}
                    className="flex min-h-56 flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-[0_10px_24px_-24px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_18px_35px_-24px_rgba(15,118,110,0.4)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-950">
                          {monthName(candidate.period_month)} {candidate.period_year}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          United States
                        </p>
                      </div>
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
                          candidate.published && (approved || adminMode)
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                            : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-3 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Report</dt>
                        <dd className="font-semibold text-slate-800">
                          Monthly summary
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Client approval</dt>
                        <dd className="font-semibold text-slate-800">
                          {approved ? "Approved" : "Pending"}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Updated</dt>
                        <dd className="font-semibold text-slate-800">
                          {updatedLabel(candidate.updated_at)}
                        </dd>
                      </div>
                    </dl>

                    <Link
                      href={periodHref(candidate)}
                      className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-teal-700 hover:bg-teal-50 hover:text-teal-800"
                    >
                      Open report
                    </Link>
                  </article>
                );
              })}
            </div>
            ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
              <h2 className="text-lg font-bold text-slate-950">
                No reports match these filters
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Select another month or year to view available reports.
              </p>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
