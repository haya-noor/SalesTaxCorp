/*
Serves a client-uploaded document to the admin for download.

The bucket is private, so files are never linked to directly. This route
confirms an admin is logged in, looks up the client_documents row (RLS
already restricts this to admins), and streams the file back with its
original filename via Content-Disposition.
*/
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  const { supabase } = await requireAdmin();

  const { data: document } = await supabase
    .from("client_documents")
    .select("file_path, original_filename")
    .eq("id", documentId)
    .maybeSingle();

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const adminClient = createSupabaseAdminClient();
  const { data: file, error } = await adminClient.storage
    .from("client-documents")
    .download(document.file_path);

  if (error || !file) {
    return NextResponse.json(
      { error: "The document could not be loaded." },
      { status: 500 },
    );
  }

  return new NextResponse(await file.arrayBuffer(), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${document.original_filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
