import Link from "next/link";
import { ClientSidebar } from "@/components/client/client-sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { logoutAction } from "@/features/auth/actions";

/*
Shared client-portal shell. On desktop it uses a full-height dark navigation
column and a separate content column, so report pages read as one integrated
application rather than a centered page with a floating navigation card.
*/
export function ClientShell({
  companyName,
  basePath = "/dashboard",
  adminMode,
  exitHref,
  children,
}: {
  companyName: string;
  basePath?: string;
  adminMode?: boolean;
  exitHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app-theme min-h-screen bg-slate-50 dark:bg-[#0f172a] lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
      <header className="portal-header border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827] lg:col-start-2 lg:row-start-1">
        <div className="flex min-h-20 flex-wrap items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={basePath}
            className="flex items-center gap-3 text-slate-950 lg:hidden"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-lg font-bold text-white shadow-sm">
              {"\u2713"}
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">
                SalesTaxCorp
              </span>
              <span className="block text-sm font-medium text-slate-500">
                Client portal
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            {adminMode ? (
              <>
                <Link
                  href="/admin"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-base font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Admin overview
                </Link>
                <Link
                  href={exitHref ?? "/admin/clients"}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  Manage client
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard/account"
                  className="text-base font-semibold text-slate-600 hover:text-teal-800 dark:text-slate-300 dark:hover:text-teal-300"
                >
                  My account
                </Link>
                <form action={logoutAction}>
                  <Button type="submit" variant="ghost">
                    Log out
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>

        {adminMode ? (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-200 sm:px-6 lg:px-8">
            Administrator workspace &mdash; managing {companyName}. Changes made here
            can affect what the client sees.
          </div>
        ) : null}
      </header>

      <aside className="w-full bg-[#171e2a] dark:bg-[#111827] lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <Link
          href={basePath}
          className="hidden min-h-20 items-center gap-3 border-b border-white/10 px-6 text-white lg:flex"
        >
          <span className="grid size-10 place-items-center rounded-full border border-emerald-400/40 bg-teal-900 text-lg font-bold text-emerald-300">
            {"\u2713"}
          </span>
          <span>
            <span className="block text-base font-bold tracking-tight">
              SalesTaxCorp
            </span>
            <span className="block text-xs font-medium text-slate-400">
              Client portal
            </span>
          </span>
        </Link>

        <div className="p-5 lg:sticky lg:top-0 lg:px-4 lg:py-7">
          <p className="mb-4 px-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
            {companyName}
          </p>
          <ClientSidebar basePath={basePath} />
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:col-start-2 lg:row-start-2 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
