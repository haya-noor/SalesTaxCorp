/*
This file contains the admin-side Server Actions for publishing monthly
client reports.

It handles:
- Uploading a report HTML file for a client/month to Supabase Storage and
  upserting the matching filing_periods row.
- Toggling a filing period between published and unpublished (draft).

Every action calls requireAdmin(), so these operations can only be
performed by an authenticated administrator.
*/
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { buildReportStoragePath } from "@/lib/storage-paths";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  deleteReportSchema,
  setPeriodPublishedSchema,
  uploadReportSchema,
} from "./reports-schemas";

type AdminWorkspace = "admin" | "client-portal";

function getWorkspace(formData: FormData): AdminWorkspace {
  return formData.get("workspace") === "client-portal"
    ? "client-portal"
    : "admin";
}

function go(
  clientId: string | undefined,
  workspace: AdminWorkspace,
  kind: "success" | "error",
  message: string,
): never {
  const params = new URLSearchParams({ [kind]: message });
  if (workspace === "client-portal" && clientId) {
    redirect(`/client-portal/${clientId}/reports?${params.toString()}`);
  }

  if (clientId) params.set("client", clientId);
  redirect(`/admin/reports?${params.toString()}`);
}

function revalidateReportPaths(clientId: string) {
  revalidatePath("/admin/reports");
  revalidatePath("/dashboard/reports");
  revalidatePath(`/client-portal/${clientId}`);
  revalidatePath(`/client-portal/${clientId}/reports`);
}

// Uploads a generated report file for a client/month and upserts its filing_periods row.
export async function uploadReportAction(formData: FormData) {
  const workspace = getWorkspace(formData);
  const parsed = uploadReportSchema.safeParse({
    clientId: formData.get("clientId"),
    periodYear: formData.get("periodYear"),
    periodMonth: formData.get("periodMonth"),
    published: formData.get("published") ? "true" : "false",
  });

  const file = formData.get("file");

  if (!parsed.success || !(file instanceof File) || file.size === 0) {
    go(
      parsed.success ? parsed.data.clientId : undefined,
      workspace,
      "error",
      "Fill in the required fields and choose a report file.",
    );
  }

  const { supabase } = await requireAdmin();
  const { data: client } = await supabase
    .from("clients")
    .select("id, client_code")
    .eq("id", parsed.data.clientId)
    .maybeSingle();

  if (!client) {
    go(
      parsed.data.clientId,
      workspace,
      "error",
      "That client could not be found.",
    );
  }

  if (!client.client_code) {
    go(
      parsed.data.clientId,
      workspace,
      "error",
      "This client needs an approved portal user before reports can be uploaded.",
    );
  }

  const adminClient = createSupabaseAdminClient();
  const filePath = buildReportStoragePath(
    client.client_code,
    parsed.data.periodYear,
    parsed.data.periodMonth,
  );

  const { error: uploadError } = await adminClient.storage
    .from("client-reports")
    .upload(filePath, file, {
      contentType: "text/html",
      upsert: true,
    });

  if (uploadError) {
    go(
      parsed.data.clientId,
      workspace,
      "error",
      "The report file could not be uploaded.",
    );
  }

  const { error: upsertError } = await adminClient
    .from("filing_periods")
    .upsert(
      {
        client_id: parsed.data.clientId,
        period_year: parsed.data.periodYear,
        period_month: parsed.data.periodMonth,
        file_path: filePath,
        published: parsed.data.published ?? false,
      },
      { onConflict: "client_id,period_year,period_month" },
    );

  if (upsertError) {
    go(parsed.data.clientId, workspace, "error", "The report could not be saved.");
  }

  revalidateReportPaths(parsed.data.clientId);

  go(parsed.data.clientId, workspace, "success", "Report saved.");
}

// Toggles a filing period between published (visible to the client) and draft.
export async function setPeriodPublishedAction(formData: FormData) {
  const workspace = getWorkspace(formData);
  const parsed = setPeriodPublishedSchema.safeParse({
    periodId: formData.get("periodId"),
    clientId: formData.get("clientId"),
    published: formData.get("published"),
  });

  if (!parsed.success) {
    go(undefined, workspace, "error", "Invalid report update.");
  }

  const { supabase } = await requireAdmin();
  const { data: period } = await supabase
    .from("filing_periods")
    .select("file_path")
    .eq("id", parsed.data.periodId)
    .eq("client_id", parsed.data.clientId)
    .maybeSingle();

  if (!period) {
    go(parsed.data.clientId, workspace, "error", "Report not found.");
  }

  if (parsed.data.published) {
    if (!period.file_path) {
      go(
        parsed.data.clientId,
        workspace,
        "error",
        "Upload or replace the report file before publishing.",
      );
    }

    const adminClient = createSupabaseAdminClient();
    const { data: file, error: fileError } = await adminClient.storage
      .from("client-reports")
      .download(period.file_path);

    if (fileError || !file) {
      go(
        parsed.data.clientId,
        workspace,
        "error",
        "The stored report file is missing. Replace it before publishing.",
      );
    }
  }

  const { error } = await supabase
    .from("filing_periods")
    .update({ published: parsed.data.published })
    .eq("id", parsed.data.periodId)
    .eq("client_id", parsed.data.clientId);

  if (error) {
    go(
      parsed.data.clientId,
      workspace,
      "error",
      "The report status could not be changed.",
    );
  }

  revalidateReportPaths(parsed.data.clientId);

  go(
    parsed.data.clientId,
    workspace,
    "success",
    parsed.data.published ? "Report published." : "Report unpublished.",
  );
}

// Hides the report first, then removes its Storage object and database row.
// If either deletion step fails, the unpublished row remains invisible to clients.
export async function deleteReportAction(formData: FormData) {
  const workspace = getWorkspace(formData);
  const parsed = deleteReportSchema.safeParse({
    periodId: formData.get("periodId"),
    clientId: formData.get("clientId"),
  });

  if (!parsed.success) {
    go(undefined, workspace, "error", "Invalid report deletion.");
  }

  const { supabase } = await requireAdmin();
  const { data: period } = await supabase
    .from("filing_periods")
    .select("file_path")
    .eq("id", parsed.data.periodId)
    .eq("client_id", parsed.data.clientId)
    .maybeSingle();

  if (!period) {
    go(parsed.data.clientId, workspace, "error", "Report not found.");
  }

  const adminClient = createSupabaseAdminClient();
  const { error: unpublishError } = await adminClient
    .from("filing_periods")
    .update({ published: false })
    .eq("id", parsed.data.periodId)
    .eq("client_id", parsed.data.clientId);

  if (unpublishError) {
    go(
      parsed.data.clientId,
      workspace,
      "error",
      "The report could not be hidden from clients.",
    );
  }

  revalidateReportPaths(parsed.data.clientId);

  if (period.file_path) {
    const { error: storageError } = await adminClient.storage
      .from("client-reports")
      .remove([period.file_path]);

    if (storageError) {
      go(
        parsed.data.clientId,
        workspace,
        "error",
        "The report is hidden, but its stored file could not be deleted. Try again.",
      );
    }
  }

  const { error: deleteError } = await adminClient
    .from("filing_periods")
    .delete()
    .eq("id", parsed.data.periodId)
    .eq("client_id", parsed.data.clientId);

  if (deleteError) {
    go(
      parsed.data.clientId,
      workspace,
      "error",
      "The file was removed and the report is hidden, but its record could not be deleted. Try again.",
    );
  }

  revalidateReportPaths(parsed.data.clientId);
  go(parsed.data.clientId, workspace, "success", "Report deleted.");
}
