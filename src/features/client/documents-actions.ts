
/*
This file contains the client-side Server Action for uploading a document.

Uploaded files are never shown back to the client: the action only ever
redirects with a success or error flash message. Only admins can see and
download what was uploaded (see /admin/documents).
*/
"use server";

import { redirect } from "next/navigation";
import { requireClientUser } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function go(kind: "success" | "error", message: string): never {
  const params = new URLSearchParams({ [kind]: message });
  redirect(`/dashboard/documents?${params.toString()}`);
}

export async function uploadDocumentAction(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    go("error", "Choose a file to upload.");
  }

  const { user, client } = await requireClientUser();

  const adminClient = createSupabaseAdminClient();
  const filePath = `${client.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await adminClient.storage
    .from("client-documents")
    .upload(filePath, file);

  if (uploadError) {
    go("error", "The document could not be uploaded.");
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
    go("error", "The document could not be saved.");
  }

  go("success", "Document uploaded.");
}
