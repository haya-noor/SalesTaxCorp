/*
This file contains the reusable authentication and authorization guards used throughout the application.
It:
- Ensures a visitor is logged in.
- Retrieves the logged-in user's application profile.
- Restricts admin-only pages/actions to active admins.
- Restricts client pages/actions to approved, active client users.
- Redirects pending client accounts to the pending-approval page.
- Verifies that the client company itself is active.
- Verifies that a requested store belongs to the logged-in client's company.
These guards centralize access-control logic so it does not have to be
repeated across individual pages, Server Actions, or future report routes.
*/

import { redirect } from "next/navigation";
import { PROFILE_STATUSES, ROUTES, USER_ROLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/*
BASIC AUTHENTICATION
Ensures that someone is logged in.
If there is no authenticated Supabase user, they are sent to /login.
*/
export async function requireUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(ROUTES.LOGIN);

  return { supabase, user };
}

/*
CURRENT PROFILE LOOKUP
Returns the logged-in user's application profile from the profiles table.
Unlike requireUser(), this does not redirect if nobody is logged in; it simply returns null.
*/
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data;
}

/*
ADMIN AUTHORIZATION
Ensures that the logged-in user:
  - has a profile
  - has the admin role
  - has an active account
Used to protect admin pages and admin Server Actions.
*/
export async function requireAdmin() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    profile.role !== USER_ROLES.ADMIN ||
    profile.status !== PROFILE_STATUSES.ACTIVE
  ) {
    redirect(ROUTES.ACCESS_DENIED);
  }

  return { supabase, user, profile };
}

/*
CLIENT AUTHORIZATION
Ensures that the logged-in user is a valid approved client user.
Pending users are redirected to the pending-approval page.
Suspended users or users without a client company are denied access.
It also verifies that the assigned client company is still active.
*/
export async function requireClientUser() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== USER_ROLES.CLIENT) {
    redirect(ROUTES.ACCESS_DENIED);
  }

  if (profile.status === PROFILE_STATUSES.PENDING) {
    redirect(ROUTES.PENDING);
  }

  if (
    profile.status !== PROFILE_STATUSES.ACTIVE ||
    !profile.client_id
  ) {
    redirect(ROUTES.ACCESS_DENIED);
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", profile.client_id)
    .maybeSingle();

  if (!client || client.status !== "active") {
    redirect(ROUTES.ACCESS_DENIED);
  }

  return { supabase, user, profile, client };
}

/*
STORE ACCESS AUTHORIZATION
Ensures that the requested store:
  - exists
  - belongs to the logged-in client's company
  - is currently active
This is important for store-specific dashboard pages now, and can later be reused for store-specific PDF/report
access.
*/
export async function requireStoreAccess(storeId: string) {
  const context = await requireClientUser();

  const { data: store } = await context.supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .eq("client_id", context.client.id)
    .eq("status", "active")
    .maybeSingle();

  if (!store) {
    redirect(ROUTES.ACCESS_DENIED);
  }

  return { ...context, store };
}
