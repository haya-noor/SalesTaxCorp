export function StatusBadge({ status }: { status: string }) {
  const colors =
    status === "active"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : status === "pending"
        ? "bg-amber-50 text-amber-700 ring-amber-600/20"
        : "bg-slate-100 text-slate-700 ring-slate-500/20";

  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold capitalize ring-1 ring-inset ${colors}`}>
      {status}
    </span>
  );
}
