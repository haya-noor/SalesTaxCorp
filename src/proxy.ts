/*
This file connects Next.js request handling to the Supabase session-refresh logic.
It:
- Runs for most incoming application requests.
- Sends each matching request through updateSession().
- Lets Supabase keep authentication/session cookies refreshed.
- Skips static assets such as images, favicon files, and Next.js generated static files.
This helps logged-in users stay authenticated as they navigate through the app.
*/
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}
/*
The matcher tells Next.js which incoming URLs should run through this proxy.
So requests like these will go through updateSession():
/login
/signup
/admin
/admin/clients
/dashboard
/dashboard/account

But these are skipped:
/_next/static/...
/_next/image/...
/favicon.ico
/logo.png
/banner.jpg
/icon.svg
*/
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};