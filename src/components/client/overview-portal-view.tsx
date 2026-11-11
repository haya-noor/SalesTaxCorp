import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  ExpandIcon,
  FolderIcon,
  ReportIcon,
  UploadIcon,
  UserIcon,
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
import { listAllPublishedPeriods, monthName, type FilingPeriod } from "@/lib/reports";
import type { Database } from "@/types/database";

function periodLabel(period: Pick<FilingPeriod, "period_month" | "period_year">) {
  return `${monthName(period.period_month)} ${period.period_year}`;
}

function StatTile({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
  tone?: "default" | "attention" | "good";
}) {
  const accent =
    tone === "attention"
      ? "text-amber-700 dark:text-amber-300"
      : tone === "good"
        ? "text-brand dark:text-brand-bright"
        : "text-ink dark:text-slate-50";

  return (
    <div className={portalCard("p-5")}>
      <p className="font-code text-[11px] uppercase tracking-[0.16em] text-ink-faint dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-3 font-heading text-[1.65rem] font-semibold leading-none tracking-tight ${accent}`}>
        {value}
      </p>
      <p className="mt-2 text-[13px] text-ink-faint dark:text-slate-400">{detail}</p>
    </div>
  );
}

/*
Default landing tab of the client portal: a dashboard of where the client's
reporting stands (approvals waiting, recent reports, quick links) above the
current month's report itself. Reports are usually published after a month
closes, so when this month's report isn't out yet it shows the most recent
published one and says so. Administrators see exactly what the client sees
(published reports only), without the approve button.
*/
export async function OverviewPortalView({
  supabase,
  clientId,
  basePath,
  companyName,
  notice,
  adminMode = false,
}: {
  notice?: React.ReactNode;
  supabase: SupabaseClient<Database>;
  clientId: string;
  basePath: string;
  companyName?: string;
  adminMode?: boolean;
}) {
  // Oldest first.
  const periods = await listAllPublishedPeriods(supabase, clientId);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const currentPeriod = periods.find(
    (candidate) =>
      candidate.period_year === currentYear &&
      candidate.period_month === currentMonth,
  );
  const period = currentPeriod ?? periods.at(-1);
  const isCurrent = Boolean(currentPeriod);

  const newestFirst = [...periods].reverse();
  const pending = newestFirst.filter((candidate) => !candidate.client_approved_at);
  const thisYear = periods.filter((candidate) => candidate.period_year === currentYear);
  const approvedThisYear = thisYear.filter((candidate) => candidate.client_approved_at);
  const recent = newestFirst.slice(0, 5);

  const reportHref = (candidate: FilingPeriod) =>
    `${basePath}/reports?year=${candidate.period_year}&period=${candidate.id}`;

  const actions = (
    <>
      <Link href={`${basePath}/reports`} className={portalButton.secondary}>
        <ReportIcon className="size-4" />
        All reports
      </Link>
      {!adminMode ? (
        <Link href={`${basePath}/documents`} className={portalButton.primary}>
          <UploadIcon className="size-4" />
          Send a document
        </Link>
      ) : null}
    </>
  );

  if (!period) {
    return (
      <PortalPage
        eyebrow="Overview"
        title={adminMode ? companyName ?? "Overview" : "Welcome to your portal"}
        description="Your monthly sales tax reports, approvals and documents live here."
        actions={actions}
        notice={notice}
      >
        <div className={portalCard("mx-auto max-w-2xl px-6 py-14 text-center")}>
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-wash text-brand dark:bg-emerald-950/60 dark:text-brand-bright">
            <ReportIcon className="size-7" />
          </div>
          <h2 className="mt-5 font-heading text-xl font-semibold">No report published yet</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-ink-soft dark:text-slate-300">
            Your first monthly summary will appear here as soon as your specialist
            publishes it. We&apos;ll keep everything else in one place too.
          </p>
        </div>
      </PortalPage>
    );
  }

  return (
    <PortalPage
      eyebrow={`Overview · ${monthName(currentMonth)} ${currentYear}`}
      title={adminMode ? companyName ?? "Overview" : "Welcome back"}
      description={
        companyName
          ? `Here's where sales tax reporting stands for ${companyName} this month.`
          : "Here's where your sales tax reporting stands this month."
      }
      actions={actions}
      notice={notice}
    >
      <div className="grid gap-6">
        {pending.length ? (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-5 py-4 dark:border-amber-800/60 dark:from-amber-950/40 dark:to-slate-900">
            <div className="flex items-start gap-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                <ClockIcon className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-ink dark:text-slate-50">
                  {pending.length === 1
                    ? `${periodLabel(pending[0])} is waiting for ${adminMode ? "the client's" : "your"} approval`
                    : `${pending.length} reports are waiting for ${adminMode ? "the client's" : "your"} approval`}
                </p>
                <p className="mt-0.5 text-sm text-ink-soft dark:text-slate-300">
                  Review the summary, then approve it so we can close out the month.
                </p>
              </div>
            </div>
            <Link href={reportHref(pending[0])} className={portalButton.secondary}>
              Review {monthName(pending[0].period_month)}
              <ArrowRightIcon className="size-4" />
            </Link>
          </section>
        ) : (
          <section className="flex items-center gap-3.5 rounded-2xl border border-brand/20 bg-gradient-to-r from-brand-wash/70 to-white px-5 py-4 dark:border-emerald-800/50 dark:from-emerald-950/40 dark:to-slate-900">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white">
              <CheckIcon className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-ink dark:text-slate-50">You&apos;re all caught up</p>
              <p className="mt-0.5 text-sm text-ink-soft dark:text-slate-300">
                Every published report has been approved. We&apos;ll let you know when
                the next one is ready.
              </p>
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatTile
            label="Latest report"
            value={periodLabel(newestFirst[0])}
            detail={`Updated ${formatDate(newestFirst[0].updated_at)}`}
          />
          <StatTile
            label="Awaiting approval"
            value={pending.length}
            detail={pending.length === 1 ? "report to review" : "reports to review"}
            tone={pending.length ? "attention" : "good"}
          />
          <StatTile
            label={`Approved in ${currentYear}`}
            value={
              <>
                {approvedThisYear.length}
                <span className="text-base font-medium text-ink-faint dark:text-slate-400">
                  {" "}
                  / {thisYear.length}
                </span>
              </>
            }
            detail="published this year"
            tone="good"
          />
          <StatTile
            label="Reports on file"
            value={periods.length}
            detail={`Since ${periodLabel(periods[0])}`}
          />
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section className={portalCard("overflow-hidden")}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-5 dark:border-slate-700/80 sm:px-6">
              <div>
                <p className="font-code text-[11px] uppercase tracking-[0.16em] text-brand dark:text-brand-bright">
                  {isCurrent ? "This month" : "Most recent report"}
                </p>
                <h2 className="mt-1.5 font-heading text-xl font-semibold tracking-tight text-ink dark:text-slate-50">
                  {periodLabel(period)} summary
                </h2>
                <p className="mt-1 text-sm text-ink-faint dark:text-slate-400">
                  {isCurrent
                    ? `United States · Updated ${formatDate(period.updated_at)}`
                    : `${monthName(currentMonth)}'s report isn't published yet, so this is your latest one.`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {adminMode ? (
                  <StatusPill tone={period.client_approved_at ? "approved" : "pending"} size="md">
                    {period.client_approved_at ? "Approved by client" : "Pending client approval"}
                  </StatusPill>
                ) : (
                  <ReportApprovalStatus period={period} returnTo="overview" />
                )}
                <Link
                  href={reportHref(period)}
                  className="inline-flex size-10 items-center justify-center rounded-lg border border-line text-ink-soft transition hover:border-brand hover:text-brand dark:border-slate-600 dark:text-slate-300 dark:hover:border-brand-bright dark:hover:text-brand-bright"
                  aria-label="Open report full screen"
                  title="Open full screen"
                >
                  <ExpandIcon className="size-4" />
                </Link>
              </div>
            </div>
            <ReportFrame
              key={period.id}
              periodId={period.id}
              title={`${periodLabel(period)} report`}
              className="h-[min(78vh,880px)] min-h-[560px]"
            />
          </section>

          <aside className="grid gap-6 xl:sticky xl:top-24">
            <section className={portalCard()}>
              <div className="flex items-center justify-between px-5 pb-2 pt-5">
                <h2 className="font-heading text-base font-semibold text-ink dark:text-slate-50">
                  Recent reports
                </h2>
                <Link
                  href={`${basePath}/reports`}
                  className="text-[13px] font-semibold text-brand hover:text-brand-deep dark:text-brand-bright"
                >
                  View all
                </Link>
              </div>
              <ul className="px-2 pb-2">
                {recent.map((candidate) => (
                  <li key={candidate.id}>
                    <Link
                      href={reportHref(candidate)}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-paper dark:hover:bg-slate-800"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-paper font-code text-[11px] font-medium uppercase text-ink-soft dark:bg-slate-800 dark:text-slate-300">
                        {monthName(candidate.period_month).slice(0, 3)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink dark:text-slate-100">
                          {periodLabel(candidate)}
                        </span>
                        <span className="block text-xs text-ink-faint dark:text-slate-400">
                          Updated {formatDate(candidate.updated_at)}
                        </span>
                      </span>
                      <StatusPill tone={candidate.client_approved_at ? "approved" : "pending"}>
                        {candidate.client_approved_at ? "Approved" : "Pending"}
                      </StatusPill>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className={portalCard("p-2")}>
              <h2 className="px-3 pb-1 pt-3 font-heading text-base font-semibold text-ink dark:text-slate-50">
                Quick links
              </h2>
              {[
                {
                  href: `${basePath}/documents`,
                  label: "Send a document",
                  text: "Share a notice or file with your account manager",
                  Icon: FolderIcon,
                },
                {
                  href: `${basePath}/reports`,
                  label: "Report library",
                  text: "Filter every monthly summary by month and year",
                  Icon: ReportIcon,
                },
                ...(!adminMode
                  ? [
                      {
                        href: "/dashboard/account",
                        label: "My account",
                        text: "Update your password and contact details",
                        Icon: UserIcon,
                      },
                    ]
                  : []),
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-paper dark:hover:bg-slate-800"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-wash text-brand dark:bg-emerald-950/60 dark:text-brand-bright">
                    <item.Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink dark:text-slate-100">
                      {item.label}
                    </span>
                    <span className="block text-xs leading-5 text-ink-faint dark:text-slate-400">
                      {item.text}
                    </span>
                  </span>
                  <ArrowRightIcon className="mt-2 size-4 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-brand dark:text-slate-500" />
                </Link>
              ))}
            </section>
          </aside>
        </div>
      </div>
    </PortalPage>
  );
}
