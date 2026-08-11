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
      <div className="grid gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <span className="absolute inset-x-0 top-0 h-1 bg-teal-600" />
            <p className="text-base font-semibold text-slate-600">{stat.label}</p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="border-teal-100 bg-gradient-to-br from-white to-teal-50/70">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-teal-700">
          Portal management
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">Next steps</h2>
        <p className="mt-3 max-w-3xl text-base text-slate-600">
          Create client companies and stores, then review pending signup requests.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-xl bg-teal-700 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-teal-800" href="/admin/clients">
            Manage clients
          </Link>
          <Link className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold shadow-sm hover:border-teal-300" href="/admin/users">
            Review accounts
          </Link>
        </div>
      </Card>
    </div>
  );
}
