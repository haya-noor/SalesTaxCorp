import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/field";
import { FlashMessage } from "@/components/shared/flash-message";
import { setClientStatusAction } from "@/features/admin/actions";
import { requireAdmin } from "@/lib/auth/guards";

export default async function SuspendClientPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("company_name");

  return (
    <div>
      <AdminPageHeader
        title="Suspend client"
        description="Temporarily suspend a client's access to the portal. Suspended clients can be reactivated at any time."
        breadcrumbs={[
          { label: "Overview", href: "/admin" },
          { label: "Suspend client" },
        ]}
      />

      <FlashMessage {...params} />

      <Card>
        <h2 className="text-xl font-bold">Manage client access</h2>
        <p className="mt-2 text-base text-slate-500">
          Select a client to view its status and make changes.
        </p>

        <div className="mt-6 space-y-6">
          {clients?.map((client) => (
            <div
              key={client.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-4"
            >
              <div>
                <p className="font-semibold text-slate-950">
                  {client.company_name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {client.status === "active" ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                      Suspended
                    </span>
                  )}
                </p>
              </div>
              <form action={setClientStatusAction}>
                <input type="hidden" name="clientId" value={client.id} />
                <input
                  type="hidden"
                  name="status"
                  value={client.status === "active" ? "suspended" : "active"}
                />
                <Button
                  type="submit"
                  variant={client.status === "active" ? "danger" : "secondary"}
                >
                  {client.status === "active" ? "Suspend" : "Reactivate"}
                </Button>
              </form>
            </div>
          ))}

          {!clients?.length ? (
            <div className="py-8 text-center">
              <p className="text-base text-slate-500">No clients found.</p>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="mt-6 border-red-200 bg-red-50">
        <h3 className="text-base font-semibold text-red-900">
          What happens when a client is suspended?
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-red-800">
          <li>• Portal users will temporarily lose access</li>
          <li>• Reports and files remain stored and protected</li>
          <li>• All relationships and data are preserved</li>
          <li>• Can be reactivated at any time</li>
        </ul>
      </Card>
    </div>
  );
}
