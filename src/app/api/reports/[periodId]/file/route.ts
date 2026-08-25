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
import { requireReportViewer } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function unavailableReport(message: string, status: number) {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Report unavailable</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f8fafc; color: #0f172a; font-family: Arial, sans-serif; }
      main { max-width: 36rem; padding: 2rem; text-align: center; }
      h1 { margin: 0 0 .75rem; font-size: 1.5rem; }
      p { margin: 0; color: #475569; font-size: 1rem; line-height: 1.6; }
    </style>
  </head>
  <body><main><h1>Report temporarily unavailable</h1><p>${message}</p></main></body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> },
) {
  const { periodId } = await params;
  const { supabase } = await requireReportViewer();

  const { data: period } = await supabase
    .from("filing_periods")
    .select("file_path")
    .eq("id", periodId)
    .eq("published", true)
    .maybeSingle();

  if (!period?.file_path) {
    return unavailableReport(
      "This report is no longer available. Please select another month.",
      404,
    );
  }

  const adminClient = createSupabaseAdminClient();
  const { data: file, error } = await adminClient.storage
    .from("client-reports")
    .download(period.file_path);

  if (error || !file) {
    return unavailableReport(
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
