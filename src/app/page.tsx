import { redirect } from "next/navigation";
import { PROFILE_STATUSES, ROUTES, USER_ROLES } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth/guards";

export default async function HomePage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect(ROUTES.LOGIN);
  if (profile.status === PROFILE_STATUSES.PENDING) redirect(ROUTES.PENDING);
  if (profile.status !== PROFILE_STATUSES.ACTIVE) {
    redirect(ROUTES.ACCESS_DENIED);
  }
  if (profile.role === USER_ROLES.ADMIN) redirect(ROUTES.ADMIN);
  redirect(ROUTES.DASHBOARD);
}
