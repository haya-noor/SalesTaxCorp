export function StatusBadge({ status }: { status: string }) {
  const colors =
    status === "active"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/70 dark:text-emerald-200 dark:ring-emerald-800"
      : status === "pending"
        ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/70 dark:text-amber-200 dark:ring-amber-800"
        : "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600";

  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold capitalize ring-1 ring-inset ${colors}`}>
      {status}
    </span>
  );
}
