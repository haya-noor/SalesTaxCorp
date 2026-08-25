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

function go(path: string, kind: "success" | "error", message: string): never {
  const params = new URLSearchParams({ [kind]: message });
  redirect(`${path}?${params.toString()}`);
}

export async function deleteDocumentAction(formData: FormData) {
  const documentId = idSchema.safeParse(formData.get("documentId"));
  const clientId = idSchema.safeParse(formData.get("clientId"));
  const path = `/admin/documents?client=${formData.get("clientId") ?? ""}`;

  if (!documentId.success || !clientId.success) {
    go(path, "error", "Invalid document.");
  }

  const { supabase } = await requireAdmin();

  const { data: document } = await supabase
    .from("client_documents")
    .select("file_path")
    .eq("id", documentId.data)
    .eq("client_id", clientId.data)
    .maybeSingle();

  if (!document) {
    go(path, "error", "Document not found.");
  }

  const adminClient = createSupabaseAdminClient();

  await adminClient.storage.from("client-documents").remove([document.file_path]);

  const { error } = await adminClient
    .from("client_documents")
    .delete()
    .eq("id", documentId.data);

  if (error) {
    go(path, "error", "The document could not be deleted.");
  }

  revalidatePath("/admin/documents");

  go(path, "success", "Document deleted.");
}
