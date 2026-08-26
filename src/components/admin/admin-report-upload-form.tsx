import { Button } from "@/components/ui/button";
import { Field, SelectField } from "@/components/ui/field";
import { uploadReportAction } from "@/features/admin/reports-actions";
import { monthName } from "@/lib/reports";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export function AdminReportUploadForm({
  clientId,
  workspace = "admin",
}: {
  clientId: string;
  workspace?: "admin" | "client-portal";
}) {
  const now = new Date();

  return (
    <form
      action={uploadReportAction}
      encType="multipart/form-data"
      className="mt-5 grid gap-4 sm:grid-cols-2"
    >
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="workspace" value={workspace} />
      <SelectField
        label="Month"
        name="periodMonth"
        defaultValue={now.getMonth() + 1}
      >
        {MONTHS.map((month) => (
          <option key={month} value={month}>
            {monthName(month)}
          </option>
        ))}
      </SelectField>
      <Field
        label="Year"
        name="periodYear"
        type="number"
        defaultValue={now.getFullYear()}
        required
      />
      <div className="sm:col-span-2">
        <label className="grid gap-2 text-base font-semibold text-slate-700">
          Report file (.html)
          <input
            type="file"
            name="file"
            accept=".html,text/html"
            required
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 shadow-sm"
          />
        </label>
      </div>
      <label className="flex items-center gap-3 text-base font-semibold text-slate-700 sm:col-span-2">
        <input type="checkbox" name="published" className="h-5 w-5" />
        Publish now (visible to the client immediately)
      </label>
      <div className="sm:col-span-2">
        <Button type="submit">Save or replace report</Button>
      </div>
    </form>
  );
}
