export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_12px_35px_-24px_rgba(15,23,42,0.35)] sm:p-7 ${className}`}
    >
      {children}
    </section>
  );
}
