"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireClientUser } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const reportIdSchema = z.uuid();

function go(
  periodId: string | undefined,
  year: number | undefined,
  kind: "success" | "error",
  message: string,
): never {
  const params = new URLSearchParams({ [kind]: message });
  if (periodId) params.set("period", periodId);
  if (year) params.set("year", String(year));
  redirect(`/dashboard/reports?${params.toString()}`);
}

// Approves only a published report that is visible to the signed-in client's
// company. The privileged write happens only after the user's RLS-scoped read
// confirms ownership, so clients cannot approve another company's report.
export async function approveReportAction(formData: FormData) {
  const parsedId = reportIdSchema.safeParse(formData.get("periodId"));

  if (!parsedId.success) {
    go(undefined, undefined, "error", "Invalid report approval request.");
  }

  const { supabase, user, client } = await requireClientUser();
  const { data: period, error: lookupError } = await supabase
    .from("filing_periods")
    .select("id, period_year, client_approved_at")
    .eq("id", parsedId.data)
    .eq("client_id", client.id)
    .eq("published", true)
    .maybeSingle();

  if (lookupError) {
    const message = ["42703", "PGRST204"].includes(lookupError.code)
      ? "Report approval is temporarily unavailable. The portal database needs its latest update."
      : "The report could not be checked. Refresh the page and try again.";
    go(parsedId.data, undefined, "error", message);
  }

  if (!period) {
    go(
      undefined,
      undefined,
      "error",
      "That report is no longer published or available. The report list has been refreshed.",
    );
  }

  if (period.client_approved_at) {
    go(period.id, period.period_year, "success", "Report already approved.");
  }

  const adminClient = createSupabaseAdminClient();
  const { data: approvedPeriod, error } = await adminClient
    .from("filing_periods")
    .update({
      client_approved_at: new Date().toISOString(),
      client_approved_by: user.id,
    })
    .eq("id", period.id)
    .eq("client_id", client.id)
    .eq("published", true)
    .is("client_approved_at", null)
    .select("id")
    .maybeSingle();

  if (error || !approvedPeriod) {
    go(
      period.id,
      period.period_year,
      "error",
      "The report could not be approved. Refresh the page and try again.",
    );
  }

  revalidatePath("/dashboard/reports");
  revalidatePath("/admin/reports");
  revalidatePath(`/client-portal/${client.id}/reports`);

  go(period.id, period.period_year, "success", "Report approved.");
}
