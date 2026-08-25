import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { FlashMessage } from "@/components/shared/flash-message";
import { updateClientNameAction } from "@/features/admin/actions";
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
  const [{ data: client }, users, documents] = await Promise.all([
    supabase.from("clients").select("*").eq("id", clientId).maybeSingle(),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client")
      .eq("client_id", clientId),
    supabase
      .from("client_documents")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId),
  ]);

  if (!client) notFound();
  const messages = await searchParams;

  return (
    <div>
      <AdminPageHeader
        title={client.company_name}
        description="Review this company and control portal availability."
        breadcrumbs={[
          { label: "Overview", href: "/admin" },
          { label: "Clients", href: "/admin/clients" },
          { label: client.company_name },
        ]}
        actions={
          <Link
            href={`/client-portal/${client.id}`}
            target="_blank"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            View client portal
          </Link>
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
              {client.client_code ? (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
                  {client.client_code}
                </span>
              ) : null}
              <StatusBadge status={client.status} />
            </div>
            <p className="mt-2 text-base text-slate-600">
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

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {[
          { label: "Portal users", value: users.count ?? 0 },
          { label: "Uploaded documents", value: documents.count ?? 0 },
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-base font-semibold text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
