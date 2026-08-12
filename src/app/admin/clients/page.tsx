import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ClientDirectory } from "@/components/admin/client-directory";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { FlashMessage } from "@/components/shared/flash-message";
import { createClientAction } from "@/features/admin/actions";
import { requireAdmin } from "@/lib/auth/guards";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const [{ data: clients }, { data: stores }, { data: profiles }] =
    await Promise.all([
      supabase.from("clients").select("*").order("company_name"),
      supabase.from("stores").select("client_id"),
      supabase.from("profiles").select("client_id").eq("role", "client"),
    ]);
  const messages = await searchParams;

  const directory =
    clients?.map((client) => ({
      ...client,
      storeCount:
        stores?.filter((store) => store.client_id === client.id).length ?? 0,
      userCount:
        profiles?.filter((profile) => profile.client_id === client.id).length ?? 0,
    })) ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Clients"
        description="Manage client companies, their stores, and portal access from one place."
        breadcrumbs={[
          { label: "Overview", href: "/admin" },
          { label: "Clients" },
        ]}
        actions={
          <details className="group relative">
            <summary className="list-none cursor-pointer rounded-xl bg-teal-700 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-teal-800">
              + Add client
            </summary>
            <Card className="absolute right-0 z-20 mt-3 w-[min(24rem,calc(100vw-2rem))] shadow-xl">
              <h2 className="text-xl font-bold">Create client</h2>
              <p className="mt-2 text-base text-slate-500">
                Add the company before approving its users.
              </p>
              <form action={createClientAction} className="mt-5 grid gap-4">
                <Field label="Company name" name="companyName" required />
                <Button type="submit">Create client</Button>
              </form>
            </Card>
          </details>
        }
      />

      <FlashMessage {...messages} />

      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Client companies</h2>
            <p className="mt-1 text-base text-slate-500">
              Select a company to manage its details and stores.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
            {directory.length} total
          </span>
        </div>

        {directory.length ? (
          <ClientDirectory clients={directory} />
        ) : (
          <div className="py-12 text-center">
            <p className="font-semibold text-slate-700">No clients created yet</p>
            <p className="mt-1 text-base text-slate-500">
              Use Add client to create the first company.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
