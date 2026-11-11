"use client";

import { useRouter } from "next/navigation";
import { monthName } from "@/lib/reports";

const selectClass =
  "h-10 min-w-36 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink transition hover:border-brand/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

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
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-line bg-white p-4 shadow-[0_12px_34px_-26px_rgba(11,26,34,0.35)] dark:border-slate-700/80 dark:bg-slate-900 sm:px-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1.5">
          <span className="font-code text-[11px] uppercase tracking-[0.16em] text-ink-faint dark:text-slate-400">
            Country
          </span>
          <select
            aria-label="Country"
            className={selectClass}
            defaultValue="us"
          >
            <option value="us">United States</option>
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="font-code text-[11px] uppercase tracking-[0.16em] text-ink-faint dark:text-slate-400">
            Month
          </span>
          <select
            aria-label="Filter reports by month"
            value={selectedMonth}
            onChange={(event) => navigate(selectedYear, event.target.value)}
            className={selectClass}
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
          <span className="font-code text-[11px] uppercase tracking-[0.16em] text-ink-faint dark:text-slate-400">
            Year
          </span>
          <select
            aria-label="Filter reports by year"
            value={selectedYear}
            onChange={(event) =>
              navigate(Number(event.target.value), selectedMonth)
            }
            className={selectClass}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="pb-2.5 text-sm text-ink-faint dark:text-slate-400">
        Showing{" "}
        <span className="font-semibold text-ink dark:text-slate-100">{reportCount}</span>{" "}
        {reportCount === 1 ? "report" : "reports"}
      </p>
    </div>
  );
}
