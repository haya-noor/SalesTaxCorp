import Link from "next/link";
import { PortalNavigation } from "@/components/shared/portal-navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";


/*
This file defines a reusable application shell/layout for authenticated pages.
It provides the common SalesTaxCorp header, subtitle, navigation links, logout button,
page title, and a main content area where each admin/client page can render its own content.
*/

export function AppLayout({
  title,
  subtitle,
  navigation,
  children,
  fullWidth = false,
}: {
  title: string;
  subtitle: string;
  navigation: Array<{ href: string; label: string }>;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const maxWidth = fullWidth ? "max-w-full" : "max-w-7xl";
  return (
    <div className="app-theme portal-shell min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <div className="h-1 bg-gradient-to-r from-teal-700 via-emerald-500 to-teal-700" />
      <header className="portal-header border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-[#111827]">
        <div className={`mx-auto flex ${maxWidth} flex-wrap items-center justify-between gap-5 px-4 py-5 sm:px-6 lg:px-8`}>
          <Link href="/" className="flex items-center gap-3 text-slate-950 dark:text-slate-100">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-lg font-bold text-white shadow-sm">
              ✓
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">
                SalesTaxCorp
              </span>
              <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                {subtitle}
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <PortalNavigation navigation={navigation} />
          </div>
        </div>
      </header>
      <main className={`mx-auto ${maxWidth} px-4 py-10 sm:px-6 lg:px-8 lg:py-12`}>
        {title ? (
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
              {subtitle}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">
              {title}
            </h1>
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
