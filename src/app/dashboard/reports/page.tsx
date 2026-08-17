import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StoreSwitcher } from "@/components/client/store-switcher";
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
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {prevPeriod ? (
                  <Link
                    href={periodHref(prevPeriod)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 shadow-sm hover:border-teal-300"
                  >
                    {monthName(prevPeriod.period_month)}
                  </Link>
                ) : null}

                <span className="rounded-xl bg-teal-700 px-5 py-2.5 text-base font-semibold text-white shadow-sm">
                  {monthName(selectedPeriod.period_month)} {selectedPeriod.period_year}
                </span>

                {nextPeriod ? (
                  <Link
                    href={periodHref(nextPeriod)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 shadow-sm hover:border-teal-300"
                  >
                    {monthName(nextPeriod.period_month)}
                  </Link>
                ) : null}
              </div>

              {years.length > 1 ? (
                <form className="flex items-end gap-3">
                  <input type="hidden" name="store" value={storeId} />
                  <label className="grid gap-2 text-base font-semibold text-slate-700">
                    Year
                    <select
                      name="year"
                      defaultValue={selectedYear}
                      className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="h-12 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 shadow-sm hover:border-teal-300"
                  >
                    Go
                  </button>
                </form>
              ) : null}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <iframe
              key={selectedPeriod.id}
              src={`/api/reports/${selectedPeriod.id}/file`}
              title={`${monthName(selectedPeriod.period_month)} ${selectedPeriod.period_year} report`}
              className="h-[calc(100vh-13rem)] w-full border-0"
            />
          </Card>
        </>
      )}
    </div>
  );
}
