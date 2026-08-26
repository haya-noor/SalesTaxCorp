import Link from "next/link";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button } from "@/components/ui/button";
import {
  deleteReportAction,
  setPeriodPublishedAction,
} from "@/features/admin/reports-actions";
import { monthName } from "@/lib/reports";
import type { FilingPeriod } from "@/lib/reports";

export function AdminReportActions({
  clientId,
  period,
  workspace = "admin",
  replaceHref = "#upload-report",
}: {
  clientId: string;
  period: FilingPeriod;
  workspace?: "admin" | "client-portal";
  replaceHref?: string;
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

      <Link
        href={replaceHref}
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-800 transition hover:bg-slate-50"
      >
        Replace
      </Link>

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
