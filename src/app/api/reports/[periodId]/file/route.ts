/*
Serves the HTML report file for a single filing period.

The bucket is private, so files are never linked to directly. Instead this
route:
- confirms the caller is an approved client user or an active admin
  (requireReportViewer), since this is used both by the client dashboard
  and the admin's read-only portal preview
- relies on the filing_periods RLS policy to only return the row if it's
  visible to the logged-in caller (their own client's published reports,
  or any client's for an admin) and published
- downloads the file server-side with the admin client and streams it back
  with an explicit text/html content type, since Supabase's signed-URL
  endpoint does not reliably preserve the stored content type
*/
import { NextResponse } from "next/server";
import { createUnavailableReportResponse } from "@/features/reports/unavailable-report-response";
import { requireReportViewer } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> },
) {
  const { periodId } = await params;
  const { supabase, profile } = await requireReportViewer();

  let periodQuery = supabase
    .from("filing_periods")
    .select("file_path")
    .eq("id", periodId);

  if (profile.role !== USER_ROLES.ADMIN) {
    periodQuery = periodQuery.eq("published", true);
  }

  const { data: period } = await periodQuery.maybeSingle();

  if (!period?.file_path) {
    return createUnavailableReportResponse(
      "This report is no longer available. Please select another month.",
      404,
    );
  }

  const adminClient = createSupabaseAdminClient();
  const { data: file, error } = await adminClient.storage
    .from("client-reports")
    .download(period.file_path);

  if (error || !file) {
    return createUnavailableReportResponse(
      "The report file could not be loaded. Please contact your account administrator.",
      503,
    );
  }

  return new NextResponse(await file.arrayBuffer(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
