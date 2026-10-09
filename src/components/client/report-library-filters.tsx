"use client";

import { useRouter } from "next/navigation";
import { monthName } from "@/lib/reports";

export function ReportLibraryFilters({
  years,
  selectedYear,
  selectedMonth,
  reportCount,
  basePath,
}: {
  years: number[];
  selectedYear: number;
  selectedMonth: string;
  reportCount: number;
  basePath: string;
}) {
  const router = useRouter();

  function navigate(year: number, month: string) {
    const params = new URLSearchParams({ year: String(year) });
    if (month !== "all") params.set("month", month);
    router.push(`${basePath}/reports?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="grid gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Country
          </span>
          <select
            aria-label="Country"
            className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            defaultValue="us"
          >
            <option value="us">United States</option>
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Month
          </span>
          <select
            aria-label="Filter reports by month"
            value={selectedMonth}
            onChange={(event) => navigate(selectedYear, event.target.value)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-teal-900"
          >
            <option value="all">All months</option>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
              <option key={month} value={month}>
                {monthName(month)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Year
          </span>
          <select
            aria-label="Filter reports by year"
            value={selectedYear}
            onChange={(event) =>
              navigate(Number(event.target.value), selectedMonth)
            }
            className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-teal-900"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="pb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {reportCount} {reportCount === 1 ? "report" : "reports"}
      </p>
    </div>
  );
}
