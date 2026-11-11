import { CheckIcon } from "@/components/client/portal-icons";
import { StatusPill, formatDate } from "@/components/client/portal-page";
import { approveReportAction } from "@/features/client/report-actions";
import type { FilingPeriod } from "@/lib/reports";

export function ReportApprovalStatus({
  period,
  returnTo = "reports",
}: {
  period: FilingPeriod;
  returnTo?: "reports" | "overview";
}) {
  const approved = Boolean(period.client_approved_at);

  return (
    <div className="flex flex-wrap items-center gap-2.5" role="status">
      {approved ? (
        <>
          <StatusPill tone="approved" size="md">
            Approved
          </StatusPill>
          {period.client_approved_at ? (
            <span className="text-[13px] text-ink-faint dark:text-slate-400">
              on {formatDate(period.client_approved_at)}
            </span>
          ) : null}
        </>
      ) : (
        <>
          <StatusPill tone="pending" size="md">
            Waiting for your approval
          </StatusPill>
          <form action={approveReportAction}>
            <input type="hidden" name="periodId" value={period.id} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(15,122,88,0.8)] transition hover:bg-brand-deep"
            >
              <CheckIcon className="size-4" />
              Approve report
            </button>
          </form>
        </>
      )}
    </div>
  );
}
