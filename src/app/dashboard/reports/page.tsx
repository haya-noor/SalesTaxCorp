import { Card } from "@/components/ui/card";
import { StoreSwitcher } from "@/components/client/store-switcher";
import { requireClientUser, requireStoreAccess } from "@/lib/auth/guards";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  const context = await requireClientUser();
  const { data: stores } = await context.supabase
    .from("stores")
    .select("*")
    .eq("client_id", context.client.id)
    .eq("status", "active")
    .order("display_name");
  const params = await searchParams;
  const storeId = params.store ?? stores?.[0]?.id;
  const selected = storeId ? await requireStoreAccess(storeId) : null;

  return (
    <div className="grid gap-6">
      {stores?.length ? (
        <Card>
          <StoreSwitcher
            stores={stores}
            selectedStoreId={selected?.store.id}
            action="/dashboard/reports"
          />
        </Card>
      ) : null}

      <Card className="py-14 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-xl text-teal-700">
          ≡
        </div>
        <h2 className="mt-4 text-xl font-bold">No reports are currently available</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
          {selected
            ? `Reports for ${selected.store.display_name} will appear here when report storage is added in Version 1B.`
            : "There are no active stores available for this account."}
        </p>
      </Card>
    </div>
  );
}
