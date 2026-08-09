import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireClientUser } from "@/lib/auth/guards";

export default async function AccountPage() {
  const { user, profile, client } = await requireClientUser();
  return (
    <Card className="max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Account details</h2>
        <StatusBadge status={profile.status} />
      </div>
      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</dt>
          <dd className="mt-1 font-medium">{profile.full_name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
          <dd className="mt-1 font-medium">{user.email}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company</dt>
          <dd className="mt-1 font-medium">{client.company_name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password recovery</dt>
          <dd className="mt-1 font-medium">Contact an administrator during Version 1 testing.</dd>
        </div>
      </dl>
    </Card>
  );
}
