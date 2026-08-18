import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StoreSwitcher } from "@/components/client/store-switcher";
import { YearSelector } from "@/components/client/year-selector";
import { requireClientUser, requireStoreAccess } from "@/lib/auth/guards";
import { listAllPublishedPeriods, monthName } from "@/lib/reports";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string; year?: string; period?: string }>;
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

  const periods = selected
    ? await listAllPublishedPeriods(selected.supabase, selected.store.id)
    : [];

  const years = Array.from(new Set(periods.map((p) => p.period_year))).sort(
    (a, b) => b - a,
  );
  const selectedYear = params.year ? Number(params.year) : years[0];

  const yearPeriods = periods.filter((p) => p.period_year === selectedYear);
  const selectedPeriod =
    (params.period
      ? periods.find((p) => p.id === params.period)
      : undefined) ?? yearPeriods[yearPeriods.length - 1];

  const selectedIndex = selectedPeriod
    ? periods.findIndex((p) => p.id === selectedPeriod.id)
    : -1;
  const prevPeriod = selectedIndex > 0 ? periods[selectedIndex - 1] : null;
  const nextPeriod =
    selectedIndex >= 0 && selectedIndex < periods.length - 1
      ? periods[selectedIndex + 1]
      : null;

  function periodHref(period: { id: string; period_year: number }) {
    return `/dashboard/reports?store=${storeId}&year=${period.period_year}&period=${period.id}`;
  }

  return (
    <div className="flex flex-col gap-4">
      {!selected ? (
        <Card className="py-14 text-center">
          <p className="text-base leading-7 text-slate-600">
            There are no active stores available for this account.
          </p>
        </Card>
      ) : !selectedPeriod ? (
        <Card className="py-14 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-xl text-teal-700">
            ≡
          </div>
          <h2 className="mt-5 text-xl font-bold">No reports are currently available</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Reports for {selected.store.display_name} will appear here once a
            monthly report has been published.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {stores?.length ? (
              <div className="min-w-56">
                <StoreSwitcher
                  stores={stores}
                  selectedStoreId={selected?.store.id}
                  action="/dashboard/reports"
                />
              </div>
            ) : null}

            <YearSelector
              years={years}
              selectedYear={selectedYear}
              storeId={storeId!}
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
              {yearPeriods.map((period) => (
                <Link
                  key={period.id}
                  href={periodHref(period)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    period.id === selectedPeriod.id
                      ? "bg-teal-700 text-white shadow-sm"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-teal-300"
                  }`}
                >
                  {monthName(period.period_month)}
                </Link>
              ))}
            </div>
          </div>

          <Card className="p-0 overflow-hidden flex-1">
            <iframe
              key={selectedPeriod.id}
              src={`/api/reports/${selectedPeriod.id}/file`}
              title={`${monthName(selectedPeriod.period_month)} ${selectedPeriod.period_year} report`}
              className="h-[calc(100vh-16rem)] w-full border-0"
            />
          </Card>
        </>
      )}
    </div>
  );
}
