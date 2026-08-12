import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminAccountPage() {
  const { user, profile } = await requireAdmin();

  return (
    <div>
      <AdminPageHeader
        title="My account"
        description="Review your administrator profile and keep your password secure."
        breadcrumbs={[
          { label: "Overview", href: "/admin" },
          { label: "My account" },
        ]}
      />

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
              Role
            </dt>
            <dd className="mt-1 font-medium">Administrator</dd>
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
    </div>
  );
}
