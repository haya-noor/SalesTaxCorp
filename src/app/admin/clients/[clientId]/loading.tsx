export default function ClientDetailLoading() {
  return (
    <div className="animate-pulse" aria-label="Loading client details">
      <div className="h-5 w-52 rounded bg-slate-200" />
      <div className="mt-4 h-11 w-80 max-w-full rounded bg-slate-200" />
      <div className="mt-8 h-40 rounded-2xl bg-white shadow-sm" />
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <div className="h-32 rounded-2xl bg-white shadow-sm" />
        <div className="h-32 rounded-2xl bg-white shadow-sm" />
        <div className="h-32 rounded-2xl bg-white shadow-sm" />
      </div>
      <div className="mt-6 h-64 rounded-2xl bg-white shadow-sm" />
    </div>
  );
}
