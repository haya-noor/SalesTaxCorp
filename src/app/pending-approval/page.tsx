import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/shared/auth-layout";
import { logoutAction } from "@/features/auth/actions";
import { requireUser } from "@/lib/auth/guards";
import { PROFILE_STATUSES, ROUTES, USER_ROLES } from "@/lib/constants";

export default async function PendingApprovalPage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect(ROUTES.ACCESS_DENIED);
  if (profile.status === PROFILE_STATUSES.ACTIVE) {
    redirect(profile.role === USER_ROLES.ADMIN ? ROUTES.ADMIN : ROUTES.DASHBOARD);
  }
  if (profile.status === PROFILE_STATUSES.SUSPENDED) {
    redirect(ROUTES.ACCESS_DENIED);
  }

  return (
    <AuthLayout
      title="Account awaiting approval"
      description="Your account was created successfully. An administrator must verify and approve it before you can access company information."
    >
      <div className="grid gap-4 text-center">
        <p className="text-sm text-slate-600">
          You can return later and sign in again to check your status.
        </p>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" className="w-full">
            Log out
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
