"use server";

import { redirect } from "next/navigation";
import { PROFILE_STATUSES, ROUTES, USER_ROLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/types/actions";
import { loginSchema, signupSchema } from "./schemas";

export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { status: "error", message: "Invalid email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) redirect(ROUTES.ACCESS_DENIED);
  if (profile.status === PROFILE_STATUSES.PENDING) redirect(ROUTES.PENDING);
  if (profile.status === PROFILE_STATUSES.SUSPENDED) {
    redirect(ROUTES.ACCESS_DENIED);
  }
  if (profile.role === USER_ROLES.ADMIN) redirect(ROUTES.ADMIN);
  redirect(ROUTES.DASHBOARD);
}

export async function signupAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    companyName: formData.get("companyName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        requested_company_name: parsed.data.companyName,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message === "User already registered"
          ? "An account already exists for this email."
          : "We could not create your account. Please try again.",
    };
  }

  redirect(ROUTES.PENDING);
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(ROUTES.LOGIN);
}
