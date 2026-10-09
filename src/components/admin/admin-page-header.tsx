import Link from "next/link";


type Breadcrumb = {
  label: string;
  href?: string;
};

export function AdminPageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      {breadcrumbs.length ? (
        <nav
          className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index ? <span aria-hidden="true">/</span> : null}
              {item.href ? (
                <Link href={item.href} className="hover:text-teal-700 dark:hover:text-teal-300">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-700 dark:text-slate-200" aria-current="page">
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
            Admin portal
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-3xl text-base text-slate-600 dark:text-slate-300">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
