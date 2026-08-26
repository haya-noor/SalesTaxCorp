/*
This file contains the admin-side Server Action for deleting a client-
uploaded document. It removes the file from Supabase Storage and its
client_documents row.

Calls requireAdmin(), so this can only be performed by an authenticated
administrator.
*/
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { idSchema } from "./schemas";

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
    redirect(`/client-portal/${clientId}/documents?${params.toString()}`);
  }

  if (clientId) params.set("client", clientId);
  redirect(`/admin/documents?${params.toString()}`);
}

export async function deleteDocumentAction(formData: FormData) {
  const workspace = getWorkspace(formData);
  const documentId = idSchema.safeParse(formData.get("documentId"));
  const clientId = idSchema.safeParse(formData.get("clientId"));

  if (!documentId.success || !clientId.success) {
    go(undefined, workspace, "error", "Invalid document.");
  }

  const { supabase } = await requireAdmin();

  const { data: document } = await supabase
    .from("client_documents")
    .select("file_path")
    .eq("id", documentId.data)
    .eq("client_id", clientId.data)
    .maybeSingle();

  if (!document) {
    go(clientId.data, workspace, "error", "Document not found.");
  }

  const adminClient = createSupabaseAdminClient();

  const { error: storageError } = await adminClient.storage
    .from("client-documents")
    .remove([document.file_path]);

  if (storageError) {
    go(
      clientId.data,
      workspace,
      "error",
      "The stored file could not be deleted.",
    );
  }

  const { error } = await adminClient
    .from("client_documents")
    .delete()
    .eq("id", documentId.data)
    .eq("client_id", clientId.data);

  if (error) {
    go(clientId.data, workspace, "error", "The document could not be deleted.");
  }

  revalidatePath("/admin/documents");
  revalidatePath(`/admin/clients/${clientId.data}`);
  revalidatePath(`/client-portal/${clientId.data}/documents`);

  go(clientId.data, workspace, "success", "Document deleted.");
}
