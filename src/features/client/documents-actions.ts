"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { requireClientUser } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function go(kind: "success" | "error", message: string): never {
  const params = new URLSearchParams({ [kind]: message });
  redirect(`/dashboard/documents?${params.toString()}`);
}

export async function uploadDocumentAction(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    go("error", "Please choose a document file.");
  }

  const { client, supabase } = await requireClientUser();

  const fileBuffer = await file.arrayBuffer();
  const fileHash = createHash("sha256").update(Buffer.from(fileBuffer)).digest("hex");

  // Check if document with same hash already exists for this client
  const { data: existing } = await supabase
    .from("client_documents")
    .select("id")
    .eq("client_id", client.id)
    .eq("file_hash", fileHash)
    .maybeSingle();

  if (existing) {
    go("error", "This document has already been uploaded.");
  }

  const adminClient = createSupabaseAdminClient();
  const filePath = `${client.id}/${Date.now()}-${file.name}`;

  // Upload to storage
  const { error: uploadError } = await adminClient.storage
    .from("client-documents")
    .upload(filePath, file, {
      contentType: file.type || "application/octet-stream",
    });

  if (uploadError) {
    go("error", "The document could not be uploaded. Please try again.");
  }

  // Insert document record
  const { error: insertError } = await adminClient.from("client_documents").insert({
    client_id: client.id,
    file_name: file.name,
    file_path: filePath,
    file_hash: fileHash,
    file_size: file.size,
  });

  if (insertError) {
    go("error", "The document could not be saved. Please try again.");
  }

  revalidatePath("/dashboard/documents");
  revalidatePath("/admin/documents");

  go("success", "Document uploaded successfully.");
}
