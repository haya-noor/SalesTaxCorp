/*
Serves the HTML report file for a single filing period.

The bucket is private, so files are never linked to directly. Instead this
route:
- confirms a client user is logged in and approved (requireClientUser)
- relies on the filing_periods RLS policy to only return the row if it
  belongs to one of that client's stores and is published
- uses the admin client (service role) to mint a short-lived signed URL
  and redirects the browser to it
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
  const { data: signed, error } = await adminClient.storage
    .from("client-reports")
    .createSignedUrl(period.file_path, 60);

  if (error || !signed) {
    return NextResponse.json(
      { error: "The report could not be loaded." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
