/*
This file contains the admin-side Server Actions for publishing monthly
client reports.

It handles:
- Uploading a report HTML file for a store/month to Supabase Storage and
  upserting the matching filing_periods row.
- Toggling a filing period between published and unpublished (draft).

Every action calls requireAdmin(), so these operations can only be
performed by an authenticated administrator.
*/
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { setPeriodPublishedSchema, uploadReportSchema } from "./reports-schemas";

function go(path: string, kind: "success" | "error", message: string): never {
  const params = new URLSearchParams({ [kind]: message });
  redirect(`${path}?${params.toString()}`);
}

// Uploads a generated report file for a store/month and upserts its filing_periods row.
export async function uploadReportAction(formData: FormData) {
  const parsed = uploadReportSchema.safeParse({
    storeId: formData.get("storeId"),
    periodYear: formData.get("periodYear"),
    periodMonth: formData.get("periodMonth"),
    published: formData.get("published") ? "true" : "false",
  });

  const file = formData.get("file");
  const path = `/admin/reports?store=${formData.get("storeId") ?? ""}`;

  if (!parsed.success || !(file instanceof File) || file.size === 0) {
    go(path, "error", "Fill in the required fields and choose a report file.");
  }

  const { supabase } = await requireAdmin();
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", parsed.data.storeId)
    .maybeSingle();

  if (!store) {
    go(path, "error", "That store could not be found.");
  }

  const adminClient = createSupabaseAdminClient();
  const filePath = `${parsed.data.storeId}/${parsed.data.periodYear}-${String(parsed.data.periodMonth).padStart(2, "0")}.html`;

  const { error: uploadError } = await adminClient.storage
    .from("client-reports")
    .upload(filePath, file, {
      contentType: "text/html",
      upsert: true,
    });

  if (uploadError) {
    go(path, "error", "The report file could not be uploaded.");
  }

  const { error: upsertError } = await adminClient
    .from("filing_periods")
    .upsert(
      {
        store_id: parsed.data.storeId,
        period_year: parsed.data.periodYear,
        period_month: parsed.data.periodMonth,
        file_path: filePath,
        published: parsed.data.published ?? false,
      },
      { onConflict: "store_id,period_year,period_month" },
    );

  if (upsertError) {
    go(path, "error", "The report could not be saved.");
  }

  revalidatePath("/admin/reports");
  revalidatePath("/dashboard/reports");

  go(path, "success", "Report saved.");
}

// Toggles a filing period between published (visible to the client) and draft.
export async function setPeriodPublishedAction(formData: FormData) {
  const parsed = setPeriodPublishedSchema.safeParse({
    periodId: formData.get("periodId"),
    storeId: formData.get("storeId"),
    published: formData.get("published"),
  });

  const path = `/admin/reports?store=${formData.get("storeId") ?? ""}`;

  if (!parsed.success) {
    go(path, "error", "Invalid report update.");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("filing_periods")
    .update({ published: parsed.data.published })
    .eq("id", parsed.data.periodId)
    .eq("store_id", parsed.data.storeId);

  if (error) {
    go(path, "error", "The report status could not be changed.");
  }

  revalidatePath("/admin/reports");
  revalidatePath("/dashboard/reports");

  go(
    path,
    "success",
    parsed.data.published ? "Report published." : "Report unpublished.",
  );
}
