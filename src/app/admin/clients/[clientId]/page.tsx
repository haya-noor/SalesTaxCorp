import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { FlashMessage } from "@/components/shared/flash-message";
import {
  createStoreAction,
  setClientStatusAction,
  setStoreStatusAction,
  updateClientNameAction,
  updateStoreNameAction,
} from "@/features/admin/actions";
import { requireAdmin } from "@/lib/auth/guards";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { clientId } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: client }, { data: stores }, users] = await Promise.all([
    supabase.from("clients").select("*").eq("id", clientId).maybeSingle(),
    supabase
      .from("stores")
      .select("*")
      .eq("client_id", clientId)
      .order("display_name"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client")
      .eq("client_id", clientId),
  ]);

  if (!client) notFound();
  const messages = await searchParams;

  return (
    <div>
      <AdminPageHeader
        title={client.company_name}
        description="Review this company, manage its stores, and control portal availability."
        breadcrumbs={[
          { label: "Overview", href: "/admin" },
          { label: "Clients", href: "/admin/clients" },
          { label: client.company_name },
        ]}
        actions={
          <a
            href="#stores"
            className="rounded-xl bg-teal-700 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            Manage stores
          </a>
        }
      />

      <FlashMessage {...messages} />

      <Card className="border-teal-100 bg-gradient-to-br from-white to-teal-50/50">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-950">
                {client.company_name}
              </h2>
              <StatusBadge status={client.status} />
            </div>
            <p className="mt-2 text-base text-slate-600">
              {stores?.length ?? 0} {(stores?.length ?? 0) === 1 ? "store" : "stores"}
              <span className="mx-2 text-slate-300">•</span>
              {users.count ?? 0} portal {(users.count ?? 0) === 1 ? "user" : "users"}
            </p>
          </div>

          <details className="group relative">
            <summary className="list-none cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 shadow-sm hover:border-teal-300">
              Edit company
            </summary>
            <div className="absolute right-0 z-10 mt-3 w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
              <h3 className="text-lg font-bold">Company name</h3>
              <form
                action={updateClientNameAction}
                className="mt-4 flex flex-wrap items-end gap-3"
              >
                <input type="hidden" name="clientId" value={client.id} />
                <div className="min-w-60 flex-1">
                  <Field
                    label="Company name"
                    name="companyName"
                    defaultValue={client.company_name}
                    required
                  />
                </div>
                <Button type="submit" variant="secondary">
                  Save changes
                </Button>
              </form>
            </div>
          </details>
        </div>
      </Card>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {[
          { label: "Stores", value: stores?.length ?? 0 },
          { label: "Portal users", value: users.count ?? 0 },
          { label: "Reports", value: 0, note: "Available in Version 1B" },
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-base font-semibold text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
            {stat.note ? (
              <p className="mt-1 text-sm text-slate-500">{stat.note}</p>
            ) : null}
          </Card>
        ))}
      </div>

      <Card id="stores" className="mt-6 scroll-mt-28">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Stores</h2>
            <p className="mt-1 text-base text-slate-500">
              Each store has its own dashboard and future report history.
            </p>
          </div>

          <details className="group relative" id="add-store">
            <summary className="list-none cursor-pointer rounded-xl bg-teal-700 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-teal-800">
              + Add store
            </summary>
            <div className="absolute right-0 z-10 mt-3 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
              <h3 className="text-lg font-bold">Create store</h3>
              <form action={createStoreAction} className="mt-4 grid gap-4">
                <input type="hidden" name="clientId" value={client.id} />
                <Field label="Store name" name="displayName" required />
                <Button type="submit">Create store</Button>
              </form>
            </div>
          </details>
        </div>

        <div className="mt-6 divide-y divide-slate-200">
          {stores?.map((store) => (
            <article
              key={store.id}
              className="flex flex-wrap items-center justify-between gap-5 py-5 first:pt-0 last:pb-0"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-950">
                    {store.display_name}
                  </h3>
                  <StatusBadge status={store.status} />
                </div>
                <p className="mt-2 text-base text-slate-500">
                  Store dashboard and report history
                </p>
              </div>

              <details className="group relative">
                <summary className="list-none cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 shadow-sm hover:border-teal-300">
                  Manage store
                </summary>
                <div className="absolute right-0 z-10 mt-3 w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
                  <h4 className="text-lg font-bold">Store settings</h4>
                  <form
                    action={updateStoreNameAction}
                    className="mt-4 grid gap-4"
                  >
                    <input type="hidden" name="storeId" value={store.id} />
                    <input type="hidden" name="clientId" value={client.id} />
                    <Field
                      label="Store name"
                      name="displayName"
                      defaultValue={store.display_name}
                      required
                    />
                    <Button type="submit" variant="secondary">
                      Save store name
                    </Button>
                  </form>

                  <div className="mt-5 border-t border-slate-200 pt-5">
                    <form action={setStoreStatusAction}>
                      <input type="hidden" name="storeId" value={store.id} />
                      <input type="hidden" name="clientId" value={client.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={store.status === "active" ? "suspended" : "active"}
                      />
                      {store.status === "active" ? (
                        <ConfirmSubmitButton message={`Suspend ${store.display_name}? Client users will no longer be able to open this store until it is reactivated.`}>
                          Suspend store
                        </ConfirmSubmitButton>
                      ) : (
                        <Button type="submit">Reactivate store</Button>
                      )}
                    </form>
                  </div>
                </div>
              </details>
            </article>
          ))}

          {!stores?.length ? (
            <div className="py-10 text-center">
              <p className="font-semibold text-slate-700">No stores created yet</p>
              <p className="mt-1 text-base text-slate-500">
                Use Add store to create the first reporting area.
              </p>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="mt-6 border-red-200 bg-red-50/40">
        <h2 className="text-lg font-bold text-red-900">Danger zone</h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">
              {client.status === "active" ? "Suspend this client" : "Reactivate this client"}
            </p>
            <p className="mt-1 max-w-3xl text-base text-slate-600">
              {client.status === "active"
                ? "Client users will temporarily lose portal access. Stores and existing relationships will not be deleted."
                : "Restore portal access for approved users belonging to this company."}
            </p>
          </div>

          <form action={setClientStatusAction}>
            <input type="hidden" name="clientId" value={client.id} />
            <input
              type="hidden"
              name="status"
              value={client.status === "active" ? "suspended" : "active"}
            />
            {client.status === "active" ? (
              <ConfirmSubmitButton message={`Suspend ${client.company_name}? Its client users will temporarily lose portal access.`}>
                Suspend client
              </ConfirmSubmitButton>
            ) : (
              <Button type="submit">Reactivate client</Button>
            )}
          </form>
        </div>
      </Card>
    </div>
  );
}
