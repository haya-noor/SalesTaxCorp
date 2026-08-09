import Link from "next/link";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/guards";


export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const [clients, stores, pending] = await Promise.all([
    // Count the number of clients in the database.
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true }),
    // Count the number of stores in the database.
    supabase
      .from("stores")
      .select("id", { count: "exact", head: true }),
    // Count the number of pending accounts in the database.
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const stats = [
    { label: "Client companies", value: clients.count ?? 0 },
    { label: "Stores", value: stores.count ?? 0 },
    { label: "Pending accounts", value: pending.count ?? 0 },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (

          <Card key={stat.label}>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
          </Card>

        ))}
      </div>

      <Card>
        <h2 className="text-lg font-bold text-slate-950">Next steps</h2>
        <p className="mt-2 text-sm text-slate-600">
          Create client companies and stores, then review pending signup requests.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">

          <Link className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white" href="/admin/clients">
            Manage clients
          </Link>

          <Link className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold" href="/admin/users">
            Review accounts
          </Link>

        </div>
      </Card>

    </div>
  );
}
