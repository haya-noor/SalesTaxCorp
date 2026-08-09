/*
This file creates the Supabase client used in SERVER-SIDE Next.js code.
It:
- Reads the current request's authentication cookies.
- Creates a Supabase server client using the public project URL and publishable key.
- Allows Supabase to read the logged-in user's session.
- Tries to update refreshed session cookies when the current server context allows it.
- Works with Server Components, Server Actions, Route Handlers, and auth guards.
*/
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createSupabaseServerClient() {
  // Get the cookies attached to the current Next.js request: includes the Supabase authentication/session cookies.
  const cookieStore = await cookies();

  // Create a server-side Supabase client using the current user's session.
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // Allows Supabase to read all current request cookies, including the user's authentication session.
        getAll() {
          return cookieStore.getAll();
        },

        // Allows Supabase to save refreshed authentication cookies
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Some Server Components are read-only and cannot modify cookies.
            // In those cases, the session-refresh proxy/middleware handles writing the updated authentication cookies instead.
          }
        },
      },
    },
  );
}