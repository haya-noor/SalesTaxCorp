import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button } from "@/components/ui/button";
import {
  deleteReportAction,
  setPeriodPublishedAction,
  setReportApprovalAction,
} from "@/features/admin/reports-actions";
import { monthName } from "@/lib/reports";
import type { FilingPeriod } from "@/lib/reports";

export function AdminReportActions({
  clientId,
  period,
  workspace = "admin",
}: {
  clientId: string;
  period: FilingPeriod;
  workspace?: "admin" | "client-portal";
}) {
  const periodLabel = `${monthName(period.period_month)} ${period.period_year}`;

  return (
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

      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${
          period.client_approved_at
            ? "bg-emerald-100 text-emerald-800"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        Approval: {period.client_approved_at ? "Approved" : "Pending"}
      </span>

      {workspace === "client-portal" ? (
        <form action={setReportApprovalAction}>
          <input type="hidden" name="periodId" value={period.id} />
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="workspace" value={workspace} />
          <input
            type="hidden"
            name="approved"
            value={period.client_approved_at ? "false" : "true"}
          />
          <Button type="submit" variant="secondary">
            {period.client_approved_at ? "Return to pending" : "Approve report"}
          </Button>
        </form>
      ) : null}

      <form action={setPeriodPublishedAction}>
        <input type="hidden" name="periodId" value={period.id} />
        <input type="hidden" name="clientId" value={clientId} />
        <input type="hidden" name="workspace" value={workspace} />
        <input
          type="hidden"
          name="published"
          value={period.published ? "false" : "true"}
        />
        {period.published ? (
          <ConfirmSubmitButton
            variant="secondary"
            message={`Unpublish ${periodLabel}? It will immediately disappear from the client portal.`}
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
        <input type="hidden" name="workspace" value={workspace} />
        <ConfirmSubmitButton
          message={`Permanently delete ${periodLabel}? This removes both the report record and its stored file.`}
        >
          Delete
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
