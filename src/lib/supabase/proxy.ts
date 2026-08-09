/*
This file keeps the user's Supabase authentication session synchronized
when a request passes through Next.js middleware/proxy logic.
It:
- Creates a server-side Supabase client for the incoming request.
- Reads the user's authentication cookies.
- Lets Supabase refresh/update authentication cookies when necessary.
- Copies any updated cookies onto the outgoing Next.js response.
- Calls Supabase Auth to validate/refresh the current user session.
This helps keep login sessions working correctly across page requests.
Conceptually:
Browser cookies
   ↓
Supabase session
   ├── access token (JWT)
   └── refresh token
Access token (JWT) can contain:
  user id
  email
  session id
  authenticated role
  token expiry
  user metadata
Refresh token:
  a random secret used to obtain a new access token when the old access token expires.
*/
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Start with a normal Next.js response that continues processing the request.
  let response = NextResponse.next({ request });

  // Create a Supabase server client that uses the cookies attached to the current Next.js request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // Give Supabase access to all authentication cookies from the incoming browser request.
        getAll() {
          return request.cookies.getAll();
        },

        // If Supabase refreshes or changes authentication cookies, update both the request and outgoing response with the new values.
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Ask Supabase for the authenticated user. This also gives Supabase an opportunity to refresh the auth session/cookies.
  await supabase.auth.getUser();

  // Return the response containing any updated authentication cookies.
  return response;
}
