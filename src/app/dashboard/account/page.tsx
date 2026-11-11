import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { PortalPage } from "@/components/client/portal-page";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireClientUser } from "@/lib/auth/guards";

export default async function AccountPage() {
  const { user, profile, client } = await requireClientUser();
  return (
    <PortalPage
      eyebrow="Account"
      title="My account"
      description="Your sign-in details and password."
    >
      <div className="grid max-w-2xl gap-6">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Account details</h2>
            <StatusBadge status={profile.status} />
          </div>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </dt>
              <dd className="mt-1 font-medium">{profile.full_name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </dt>
              <dd className="mt-1 font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Company
              </dt>
              <dd className="mt-1 font-medium">{client.company_name}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Change password</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your current password before choosing a new one. After the
            change, all active sessions will be signed out.
          </p>
          <ChangePasswordForm />
        </Card>
      </div>
    </PortalPage>
  );
}
