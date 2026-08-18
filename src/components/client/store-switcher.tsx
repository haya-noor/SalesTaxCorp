import type { Database } from "@/types/database";

type Store = Database["public"]["Tables"]["stores"]["Row"];

export function StoreSwitcher({
  stores,
  selectedStoreId,
  action = "/dashboard",
}: {
  stores: Store[];
  selectedStoreId?: string;
  action?: string;
}) {
  if (stores.length === 1) {
    return (
      <div>
        <p className="text-sm font-semibold text-slate-500">Current store</p>
        <p className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm">
          {stores[0].display_name}
        </p>
      </div>
    );
  }

  return (
    <form action={action} method="get" className="grid gap-2">
      <label className="grid gap-1.5 text-sm font-semibold text-slate-600">
        Current store
        <select
          key={selectedStoreId}
          name="store"
          defaultValue={selectedStoreId}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.display_name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-slate-50"
      >
        Switch store
      </button>
    </form>
  );
}
