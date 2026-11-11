import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminReportActions } from "@/components/admin/admin-report-actions";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ReportIcon,
} from "@/components/client/portal-icons";
import {
  PortalPage,
  StatusPill,
  formatDate,
  portalButton,
  portalCard,
} from "@/components/client/portal-page";
import { ReportApprovalStatus } from "@/components/client/report-approval-status";
import { ReportFrame } from "@/components/client/report-frame";
import { ReportLibraryFilters } from "@/components/client/report-library-filters";
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
  notice,
  adminMode = false,
}: {
  notice?: React.ReactNode;
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

  const pendingCount = periods.filter(
    (candidate) => candidate.published && !candidate.client_approved_at,
  ).length;

  if (requestedPeriod) {
    const label = `${monthName(requestedPeriod.period_month)} ${requestedPeriod.period_year}`;

    return (
      <div className="flex min-h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-3.5 dark:border-slate-700/80 dark:bg-slate-900 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3.5">
            <Link
              href={listHref()}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft transition hover:border-brand hover:text-brand dark:border-slate-600 dark:text-slate-300 dark:hover:border-brand-bright dark:hover:text-brand-bright"
              aria-label="Back to all reports"
              title="All reports"
            >
              <ArrowLeftIcon className="size-4" />
            </Link>
            <div className="min-w-0">
              <p className="font-code text-[11px] uppercase tracking-[0.16em] text-ink-faint dark:text-slate-400">
                Monthly summary · United States
              </p>
              <h1 className="truncate font-heading text-xl font-semibold tracking-tight text-ink dark:text-slate-50">
                {label}
              </h1>
            </div>
          </div>

          {!adminMode ? <ReportApprovalStatus period={requestedPeriod} /> : null}
        </div>

        {notice ? <div className="px-4 pt-4 sm:px-6 lg:px-8">{notice}</div> : null}

        {adminMode ? (
          <div className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/70 dark:bg-amber-950/40 sm:mx-6 lg:mx-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-amber-800 dark:text-amber-300">
                Administrator controls
              </p>
              <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
                Managing {label}.
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
          title={`${label} report`}
          className="h-[calc(100vh-9rem)] min-h-[720px]"
        />
      </div>
    );
  }

  return (
    <PortalPage
      eyebrow="Reports"
      title="Report library"
      description="Every monthly sales tax summary we've prepared for you, with its approval status."
      notice={notice}
      actions={
        periods.length && !adminMode ? (
          pendingCount ? (
            <StatusPill tone="pending" size="md">
              {pendingCount} waiting for approval
            </StatusPill>
          ) : (
            <StatusPill tone="approved" size="md">
              All reports approved
            </StatusPill>
          )
        ) : null
      }
    >
      {!periods.length ? (
        <div className={portalCard("mx-auto max-w-2xl px-6 py-14 text-center")}>
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-wash text-brand dark:bg-emerald-950/60 dark:text-brand-bright">
            <ReportIcon className="size-7" />
          </div>
          <h2 className="mt-5 font-heading text-xl font-semibold">
            No reports are available yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-ink-soft dark:text-slate-300">
            Reports will appear here once a monthly report has been published.
          </p>
        </div>
      ) : (
        <>
          <ReportLibraryFilters
            years={years}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            reportCount={visiblePeriods.length}
            basePath={basePath}
          />

          {visiblePeriods.length ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(270px,1fr))]">
              {visiblePeriods.map((candidate) => {
                const approved = Boolean(candidate.client_approved_at);
                const needsReview = !adminMode && !approved;
                const statusTone = adminMode
                  ? candidate.published
                    ? "approved"
                    : "draft"
                  : approved
                    ? "approved"
                    : "pending";
                const statusLabel = adminMode
                  ? candidate.published
                    ? "Published"
                    : "Draft"
                  : approved
                    ? "Approved"
                    : "Needs approval";

                return (
                  <article
                    key={candidate.id}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_12px_34px_-26px_rgba(11,26,34,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-26px_rgba(15,122,88,0.45)] dark:bg-slate-900 ${
                      needsReview
                        ? "border-amber-300/80 hover:border-amber-400 dark:border-amber-700/60"
                        : "border-line hover:border-brand/60 dark:border-slate-700/80 dark:hover:border-brand-bright/60"
                    }`}
                  >
                    {needsReview ? (
                      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-amber-400" />
                    ) : null}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-code text-[11px] uppercase tracking-[0.16em] text-ink-faint dark:text-slate-400">
                          {candidate.period_year}
                        </p>
                        <h2 className="mt-1 font-heading text-[1.6rem] font-semibold leading-none tracking-tight text-ink dark:text-slate-50">
                          {monthName(candidate.period_month)}
                        </h2>
                      </div>
                      <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
                    </div>

                    <ol className="mt-5 grid grid-cols-2 gap-2" aria-label="Report progress">
                      {[
                        { label: "Published", done: candidate.published },
                        { label: "Approved", done: approved },
                      ].map((step) => (
                        <li key={step.label}>
                          <span
                            className={`block h-1.5 rounded-full ${
                              step.done ? "bg-brand dark:bg-brand-bright" : "bg-slate-200 dark:bg-slate-700"
                            }`}
                          />
                          <span
                            className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
                              step.done
                                ? "text-ink-soft dark:text-slate-300"
                                : "text-ink-faint dark:text-slate-500"
                            }`}
                          >
                            {step.done ? <CheckIcon className="size-3" /> : null}
                            {step.label}
                          </span>
                        </li>
                      ))}
                    </ol>

                    <dl className="mt-5 grid gap-2 border-t border-line pt-4 text-sm dark:border-slate-700/80">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-ink-faint dark:text-slate-400">Report</dt>
                        <dd className="font-medium text-ink dark:text-slate-100">Monthly summary</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-ink-faint dark:text-slate-400">
                          {approved ? "Approved" : "Updated"}
                        </dt>
                        <dd className="font-medium text-ink dark:text-slate-100">
                          {formatDate(candidate.client_approved_at ?? candidate.updated_at)}
                        </dd>
                      </div>
                    </dl>

                    <Link
                      href={periodHref(candidate)}
                      className={`mt-5 w-full ${needsReview ? portalButton.primary : portalButton.secondary}`}
                    >
                      {needsReview ? "Review and approve" : "Open report"}
                      <ArrowRightIcon className="size-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/70">
              <h2 className="font-heading text-lg font-semibold text-ink dark:text-slate-100">
                No reports match these filters
              </h2>
              <p className="mt-2 text-sm text-ink-soft dark:text-slate-300">
                Select another month or year to view available reports.
              </p>
            </div>
          )}
        </>
      )}
    </PortalPage>
  );
}
