import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StoreSwitcher } from "@/components/client/store-switcher";
import { requireClientUser } from "@/lib/auth/guards";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  const { supabase, client, profile } = await requireClientUser();
  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .eq("client_id", client.id)
    .eq("status", "active")
    .order("display_name");
  const { store: requestedStoreId } = await searchParams;
  const selectedStore =
    stores?.find((store) => store.id === requestedStoreId) ?? stores?.[0];

  return (
    <div className="grid gap-6">
      <Card>
        <p className="text-sm font-semibold text-teal-700">Welcome, {profile.full_name}</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">Your sales tax portal</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Choose a store to view its reporting area. Reports will be added in the next version.
        </p>
      </Card>

      {stores?.length ? (
        <>
          <Card>
            <StoreSwitcher stores={stores} selectedStoreId={selectedStore?.id} />
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Selected store</p>
            <h2 className="mt-2 text-xl font-bold">{selectedStore?.display_name}</h2>
            <p className="mt-2 text-sm text-slate-600">
              The report dashboard for this store will appear here in Version 1B.
            </p>
            <Link
              href={`/dashboard/reports?store=${selectedStore?.id}`}
              className="mt-5 inline-flex rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Open reports
            </Link>
          </Card>
        </>
      ) : (
        <Card>
          <h2 className="text-lg font-bold">No active stores available</h2>
          <p className="mt-2 text-sm text-slate-600">
            Contact SalesTaxCorp to add or reactivate a store for this company.
          </p>
        </Card>
      )}
    </div>
  );
}
