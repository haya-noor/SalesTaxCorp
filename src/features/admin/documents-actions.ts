/*
This file contains the admin-side Server Actions for uploading and deleting
client documents. Files are kept in private Supabase Storage and mirrored by
client_documents records.

Calls requireAdmin(), so this can only be performed by an authenticated
administrator.
*/
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { buildDocumentStoragePath } from "@/lib/storage-paths";
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

export async function uploadAdminDocumentAction(formData: FormData) {
  const workspace = getWorkspace(formData);
  const clientId = idSchema.safeParse(formData.get("clientId"));
  const file = formData.get("file");

  if (!clientId.success || !(file instanceof File) || file.size === 0) {
    go(
      clientId.success ? clientId.data : undefined,
      workspace,
      "error",
      "Choose a document to upload.",
    );
  }

  const { supabase, user } = await requireAdmin();
  const { data: client } = await supabase
    .from("clients")
    .select("id, client_code")
    .eq("id", clientId.data)
    .maybeSingle();

  if (!client) {
    go(clientId.data, workspace, "error", "Client not found.");
  }

  if (!client.client_code) {
    go(
      clientId.data,
      workspace,
      "error",
      "This client needs an approved portal user before documents can be uploaded.",
    );
  }

  const adminClient = createSupabaseAdminClient();
  const filePath = buildDocumentStoragePath(client.client_code, file.name);
  const { error: uploadError } = await adminClient.storage
    .from("client-documents")
    .upload(filePath, file);

  if (uploadError) {
    go(clientId.data, workspace, "error", "The document could not be uploaded.");
  }

  const { error: insertError } = await adminClient
    .from("client_documents")
    .insert({
      client_id: client.id,
      uploaded_by: user.id,
      original_filename: file.name,
      file_path: filePath,
    });

  if (insertError) {
    await adminClient.storage.from("client-documents").remove([filePath]);
    go(clientId.data, workspace, "error", "The document could not be saved.");
  }

  revalidatePath("/admin/documents");
  revalidatePath(`/admin/clients/${clientId.data}`);
  revalidatePath(`/client-portal/${clientId.data}/documents`);
  go(clientId.data, workspace, "success", "Document uploaded.");
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
