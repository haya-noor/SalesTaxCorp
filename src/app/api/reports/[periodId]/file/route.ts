/*
Serves the HTML report file for a single filing period.

The bucket is private, so files are never linked to directly. Instead this
route:
- confirms a client user is logged in and approved (requireClientUser)
- relies on the filing_periods RLS policy to only return the row if it
  belongs to one of that client's stores and is published
- downloads the file server-side with the admin client and streams it back
  with an explicit text/html content type, since Supabase's signed-URL
  endpoint does not reliably preserve the stored content type
*/
import { NextResponse } from "next/server";
import { requireClientUser } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> },
) {
  const { periodId } = await params;
  const { supabase } = await requireClientUser();

  const { data: period } = await supabase
    .from("filing_periods")
    .select("file_path")
    .eq("id", periodId)
    .eq("published", true)
    .maybeSingle();

  if (!period?.file_path) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const adminClient = createSupabaseAdminClient();
  const { data: file, error } = await adminClient.storage
    .from("client-reports")
    .download(period.file_path);

  if (error || !file) {
    return NextResponse.json(
      { error: "The report could not be loaded." },
      { status: 500 },
    );
  }

  return new NextResponse(await file.arrayBuffer(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
