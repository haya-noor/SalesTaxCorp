import { approveReportAction } from "@/features/client/report-actions";
import type { FilingPeriod } from "@/lib/reports";

export function ReportApprovalStatus({ period }: { period: FilingPeriod }) {
  const approved = Boolean(period.client_approved_at);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-slate-600">Status:</span>
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${
          approved
            ? "bg-emerald-100 text-emerald-800"
            : "bg-amber-100 text-amber-800"
        }`}
        role="status"
      >
        {approved ? "Approved" : "Pending approval"}
      </span>

      {!approved ? (
        <form action={approveReportAction}>
          <input type="hidden" name="periodId" value={period.id} />
          <button
            type="submit"
            className="inline-flex min-h-9 items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Approve report
          </button>
        </form>
      ) : null}
    </div>
  );
}
