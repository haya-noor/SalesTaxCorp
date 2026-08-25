import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } },
) {
  try {
    await requireAdmin();

    const adminClient = createSupabaseAdminClient();

    // Get document record
    const { data: document, error: fetchError } = await adminClient
      .from("client_documents")
      .select("*")
      .eq("id", params.documentId)
      .maybeSingle();

    if (fetchError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Download file from storage
    const { data, error: downloadError } = await adminClient.storage
      .from("client-documents")
      .download(document.file_path);

    if (downloadError || !data) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return new NextResponse(data, {
      headers: {
        "Content-Disposition": `attachment; filename="${document.file_name}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
