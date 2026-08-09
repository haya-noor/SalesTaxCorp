import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { FlashMessage } from "@/components/shared/flash-message";
import { createClientAction } from "@/features/admin/actions";
import { requireAdmin } from "@/lib/auth/guards";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("company_name");
  const messages = await searchParams;

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">

      <Card className="h-fit">
        <h2 className="text-lg font-bold">Create client</h2>
        <p className="mt-1 text-sm text-slate-500">Add the company before approving its users.</p>
        <form action={createClientAction} className="mt-5 grid gap-4">
          <Field label="Company name" name="companyName" required />
          <Button type="submit">Create client</Button>
        </form>
      </Card>

      <div>
        <FlashMessage {...messages} />

        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Client companies</h2>
            <span className="text-sm text-slate-500">{clients?.length ?? 0} total</span>
          </div>

          <div className="divide-y divide-slate-100">
            {clients?.map((client) => (
              <Link
                href={`/admin/clients/${client.id}`}
                key={client.id}
                className="flex items-center justify-between gap-4 py-4 hover:text-teal-800"
              >
                <span className="font-semibold">{client.company_name}</span>
                <StatusBadge status={client.status} />
              </Link>
            ))}
            {!clients?.length ? (
              <p className="py-8 text-center text-sm text-slate-500">No clients created yet.</p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
