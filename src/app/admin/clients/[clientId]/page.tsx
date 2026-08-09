import { notFound } from "next/navigation";
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

/*
This page shows one specific client's details inside the admin portal.
It allows the admin to:
 - view the client
 - rename the client
 - suspend/reactivate the client
 - create stores under the client
 - rename stores
 - suspend/reactivate stores
*/

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  //  Contains the dynamic client ID from a route such as:   /admin/clients/123
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  //Extract the client ID from the URL.
  const { clientId } = await params;
   // Ensure that only an authenticated admin can access this page.
  const { supabase } = await requireAdmin();
  const [{ data: client }, { data: stores }] = await Promise.all([
    supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle(),
    supabase
      .from("stores")
      .select("*")
      .eq("client_id", clientId)
      .order("display_name"),
  ]);
  if (!client)
    notFound();
  const messages = await searchParams;

  return (
    <div className="grid gap-6">
      <FlashMessage {...messages} />
      {/*
        CLIENT INFORMATION CARD
        This card contains:
        - the client's current name
        - the client's current status
        - rename client form
        - suspend/reactivate client button
      */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">

          <div>
            <StatusBadge status={client.status} />
            <h2 className="mt-3 text-2xl font-bold">{client.company_name}</h2>
          </div>

          <form action={setClientStatusAction}>
            <input
              type="hidden"
              name="clientId"
              value={client.id}
            />
            <input
              type="hidden"
              name="status"
            value={
              client.status === "active" ? "suspended" : "active"}
              />
            <Button type="submit"
            variant={
              client.status === "active" ? "danger" : "secondary"}>
              {client.status === "active" ? "Suspend client" : "Reactivate client"}
            </Button>
          </form>

        </div>
        <form action={updateClientNameAction} className="mt-6 flex max-w-xl items-end gap-3">
          <input type="hidden" name="clientId" value={client.id} />
          <div className="flex-1">
            <Field label="Company name" name="companyName" defaultValue={client.company_name} required />
          </div>
          <Button type="submit" variant="secondary">Save</Button>
        </form>
      </Card>


      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Card className="h-fit">
          <h2 className="text-lg font-bold">Add store</h2>
          <form action={createStoreAction} className="mt-5 grid gap-4">
            <input type="hidden" name="clientId" value={client.id} />
            <Field label="Store name" name="displayName" required />
            <Button type="submit">Create store</Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-5 text-lg font-bold">Stores</h2>
          <div className="grid gap-4">
            {stores?.map((store) => (
              <div key={store.id} className="rounded-xl border border-slate-200 p-4">

                <div className="mb-3 flex items-center justify-between gap-3">
                  <StatusBadge status={store.status} />

                  <form action={setStoreStatusAction}>
                    <input type="hidden" name="storeId" value={store.id} />
                    <input type="hidden" name="clientId" value={client.id} />
                    <input type="hidden" name="status" value={store.status === "active" ? "suspended" : "active"} />
                    <Button type="submit" variant="ghost">
                      {store.status === "active" ? "Suspend" : "Reactivate"}
                    </Button>
                  </form>

                </div>

                <form action={updateStoreNameAction} className="flex items-end gap-3">
                  <input type="hidden" name="storeId" value={store.id} />
                  <input type="hidden" name="clientId" value={client.id} />
                  <div className="flex-1">
                    <Field label="Store name" name="displayName" defaultValue={store.display_name} required />
                  </div>
                  <Button type="submit" variant="secondary">Save</Button>
                </form>

              </div>
            ))}
            {!stores?.length ? <p className="text-sm text-slate-500">No stores created yet.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
