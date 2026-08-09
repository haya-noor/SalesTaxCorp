"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/*
This file creates the Supabase client used in browser/client-side code.
It uses the public Supabase project URL and publishable key.
*/
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
