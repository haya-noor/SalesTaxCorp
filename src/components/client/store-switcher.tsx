import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/field";
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
  return (
    <form action={action} method="get" className="flex flex-wrap items-end gap-3">
      <div className="min-w-64 flex-1">
        <SelectField label="Current store" name="store" defaultValue={selectedStoreId}>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.display_name}
            </option>
          ))}
        </SelectField>
      </div>
      <Button type="submit" variant="secondary">
        Switch store
      </Button>
    </form>
  );
}
