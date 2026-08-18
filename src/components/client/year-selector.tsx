"use client";

import { useRouter } from "next/navigation";

export function YearSelector({
  years,
  selectedYear,
  storeId,
}: {
  years: number[];
  selectedYear: number;
  storeId: string;
}) {
  const router = useRouter();

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    router.push(`/dashboard/reports?store=${storeId}&year=${year}`);
  };

  if (years.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-slate-700">Year:</span>
      <select
        defaultValue={selectedYear}
        onChange={handleYearChange}
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
