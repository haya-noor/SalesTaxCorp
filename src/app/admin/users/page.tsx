// This page is the admin user-management page.
//
// It:
// - Fetches all client user profiles.
// - Fetches client companies so users can be assigned to the correct client.
// - Fetches Supabase Auth users so their email addresses can be displayed.
// - Separates pending signups from already managed/approved users.
// - Lets the admin approve a pending user and assign them to a client.
// - Lets the admin reject a pending signup.
// - Lets the admin suspend or reactivate existing client users.
// - Shows success/error messages after admin actions.
//
// Access is restricted to admins through requireAdmin().

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { FlashMessage } from "@/components/shared/flash-message";
import {
  approveUserAction,
  rejectPendingUserAction,
  setUserStatusAction,
} from "@/features/admin/actions";
import { requireAdmin } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const adminClient = createSupabaseAdminClient();

  const [{ data: profiles }, { data: clients }, authUsers] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false }),

    supabase
      .from("clients")
      .select("id, company_name, status")
      .order("company_name"),

    adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),
  ]);

  const emailById = new Map(
    authUsers.data.users.map((user) => [user.id, user.email]),
  );

  const clientById = new Map(
    clients?.map((client) => [client.id, client.company_name]),
  );

  const pending =
    profiles?.filter(
      (profile) => profile.role === "client" && profile.status === "pending",
    ) ?? [];

  const managed =
    profiles?.filter(
      (profile) => profile.role === "client" && profile.status !== "pending",
    ) ?? [];

  const administrators =
    profiles?.filter((profile) => profile.role === "admin") ?? [];

  const messages = await searchParams;

  return (
    <div>
      <AdminPageHeader
        title="Accounts"
        description="Approve client registrations and review everyone who can access the portal."
        breadcrumbs={[
          { label: "Overview", href: "/admin" },
          { label: "Accounts" },
        ]}
      />

      <div className="grid gap-6">
      <FlashMessage {...messages} />

      <Card>
        <h2 className="text-lg font-bold">Pending accounts</h2>
        <p className="mt-1 text-sm text-slate-500">
          Verify each applicant outside the portal before approval.
        </p>

        <div className="mt-5 grid gap-4">
          {pending.map((profile) => (
            <div
              key={profile.id}
              className="rounded-xl border border-amber-200 bg-amber-50/40 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">
                    {profile.full_name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {emailById.get(profile.id) ?? "Email unavailable"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Requested company:{" "}
                    {profile.requested_company_name ?? "Not provided"}
                  </p>
                </div>
                <StatusBadge status={profile.status} />
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <form
                  action={approveUserAction}
                  className="flex flex-1 flex-wrap items-end gap-3"
                >
                  <input
                    type="hidden"
                    name="profileId"
                    value={profile.id}
                  />
                  <div className="min-w-56 flex-1">
                    <SelectField
                      label="Assign client"
                      name="clientId"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select a client
                      </option>
                      {clients
                        ?.filter((client) => client.status === "active")
                        .map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.company_name}
                          </option>
                        ))}
                    </SelectField>
                  </div>
                  <Button type="submit">Approve as client</Button>
                </form>

                <form action={rejectPendingUserAction}>
                  <input
                    type="hidden"
                    name="profileId"
                    value={profile.id}
                  />
                  <Button type="submit" variant="danger">
                    Reject
                  </Button>
                </form>
              </div>

            </div>
          ))}

          {!pending.length ? (
            <p className="text-sm text-slate-500">No pending accounts.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Administrators</h2>
        <p className="mt-1 text-sm text-slate-500">
          Fixed portal administrators. New administrators cannot be added from
          this website.
        </p>

        <div className="mt-5 divide-y divide-slate-100">
          {administrators.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div>
                <p className="font-semibold">{profile.full_name}</p>
                <p className="text-sm text-slate-500">
                  {emailById.get(profile.id) ?? "Email unavailable"}
                </p>
              </div>
              <StatusBadge status={profile.status} />
            </div>
          ))}

          {!administrators.length ? (
            <p className="py-6 text-sm text-slate-500">
              No administrators found.
            </p>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Client users</h2>

        <div className="mt-5 divide-y divide-slate-100">
          {managed.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div>
                <p className="font-semibold">{profile.full_name}</p>

                <p className="text-sm text-slate-500">
                  {emailById.get(profile.id) ?? "Email unavailable"}
                </p>

                <p className="text-sm text-slate-500">
                  {profile.client_id
                    ? clientById.get(profile.client_id) ?? "Unknown client"
                    : "No client assigned"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={profile.status} />

                <form action={setUserStatusAction}>
                  <input
                    type="hidden"
                    name="profileId"
                    value={profile.id}
                  />

                  <input
                    type="hidden"
                    name="status"
                    value={
                      profile.status === "active"
                        ? "suspended"
                        : "active"
                    }
                  />

                  <Button type="submit" variant="secondary">
                    {profile.status === "active"
                      ? "Suspend"
                      : "Reactivate"}
                  </Button>
                </form>
              </div>
            </div>
          ))}

          {!managed.length ? (
            <p className="py-6 text-sm text-slate-500">
              No approved client users yet.
            </p>
          ) : null}
        </div>
      </Card>
      </div>
    </div>
  );
}
