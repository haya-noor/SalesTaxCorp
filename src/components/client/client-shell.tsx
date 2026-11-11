import Link from "next/link";
import { ClientSidebar, PortalBreadcrumb } from "@/components/client/client-sidebar";
import { BrandMark, GlobeIcon, LogoutIcon, UserIcon } from "@/components/client/portal-icons";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { logoutAction } from "@/features/auth/actions";

function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  return letters || "C";
}

/*
Shared client-portal shell. On desktop it is a full-height dark navigation
column beside the content column, styled with the same ink and emerald
palette as the marketing site. Below the lg breakpoint the sidebar collapses
into a compact top bar with a scrolling tab row.
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
    <div className="app-theme min-h-screen bg-paper text-ink dark:bg-[#0f172a] dark:text-slate-100 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col dark:bg-[#0b1220]">
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 px-4 sm:px-6 lg:min-h-[4.5rem] lg:px-5">
          <Link
            href={`${basePath}/overview`}
            aria-label="Sales Tax Corp client portal, go to Overview"
            title="Go to Overview"
            className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.06]"
          >
            <BrandMark className="size-9 transition group-hover:scale-105" />
            <span>
              <span className="block font-heading text-[17px] font-semibold leading-tight tracking-tight">
                Sales Tax Corp
              </span>
              <span className="block font-code text-[10.5px] uppercase tracking-[0.16em] text-white/50">
                Client portal
              </span>
            </span>
          </Link>
        </div>

        <div className="px-4 pb-3 pt-4 sm:px-6 lg:px-4 lg:pt-6">
          <div className="mb-5 hidden items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 lg:flex">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/25 font-heading text-[15px] font-semibold text-brand-bright">
              {initials(companyName)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold text-white">
                {companyName}
              </span>
              <span className="block text-xs text-white/50">Managed account</span>
            </span>
          </div>
          <p className="mb-2 hidden px-3 font-code text-[10.5px] uppercase tracking-[0.18em] text-white/35 lg:block">
            Workspace
          </p>
          <ClientSidebar basePath={basePath} />
        </div>

        <div className="mt-auto hidden p-4 lg:block">
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand/25 to-transparent p-4">
            <p className="text-sm font-semibold text-white">Questions about a report?</p>
            <p className="mt-1 text-[13px] leading-5 text-white/60">
              Send a file or note to your account manager and they&apos;ll follow up.
            </p>
            <Link
              href={`${basePath}/documents`}
              className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-bright hover:text-white"
            >
              Send a document <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="mt-3 flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
          >
            <span className="flex items-center gap-2.5">
              <GlobeIcon className="size-4" />
              Visit our website
            </span>
            <span aria-hidden="true">&#8599;</span>
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="portal-header sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur dark:border-slate-700/80 dark:bg-[#111827]/90">
          <div className="flex min-h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-[4.5rem] lg:px-8">
            <PortalBreadcrumb basePath={basePath} />
            <p className="truncate text-sm font-semibold text-ink lg:hidden dark:text-slate-100">
              {companyName}
            </p>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener"
                aria-label="Visit our website"
                title="Visit our website"
                className="inline-flex size-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-ink lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <GlobeIcon className="size-[18px]" />
              </a>
              <ThemeToggle className="size-10" />
              {adminMode ? (
                <>
                  <Link
                    href="/admin"
                    className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Admin overview
                  </Link>
                  <Link
                    href={exitHref ?? "/admin/clients"}
                    className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    Manage client
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard/account"
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-brand dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-brand-bright"
                  >
                    <UserIcon className="size-[18px]" />
                    <span className="hidden sm:inline">My account</span>
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <LogoutIcon className="size-[18px]" />
                      <span className="hidden sm:inline">Log out</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {adminMode ? (
            <div className="border-t border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm font-semibold text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-200 sm:px-6 lg:px-8">
              Administrator workspace &mdash; managing {companyName}. Changes made here
              can affect what the client sees.
            </div>
          ) : null}
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
