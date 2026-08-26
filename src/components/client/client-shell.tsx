import Link from "next/link";
import { ClientSidebar } from "@/components/client/client-sidebar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";

/*
Layout shell for the client portal: header with company name/account/logout,
and a left sidebar (Reports, Registrations, Nexus study, Information,
Documents) with the page content to its right. Reports is the default
landing section.

When `adminMode` is set, this renders the same portal chrome for an admin
managing a selected client. The admin keeps their own identity and receives
an unmistakable management banner plus links back to the admin portal.
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
    <div className="min-h-screen bg-slate-50">
      <div className="h-1 bg-gradient-to-r from-teal-700 via-emerald-500 to-teal-700" />
      <header className="border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1920px] flex-wrap items-center justify-between gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <Link href={basePath} className="flex items-center gap-3 text-slate-950">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-lg font-bold text-white shadow-sm">
              ✓
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

          <div className="flex items-center gap-3">
            {adminMode ? (
              <>
                <Link
                  href="/admin"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-base font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Admin overview
                </Link>
                <Link
                  href={exitHref ?? "/admin/clients"}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-800 shadow-sm transition hover:border-teal-300"
                >
                  Manage client
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard/account"
                  className="text-base font-semibold text-slate-600 hover:text-teal-800"
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
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900 sm:px-6 lg:px-8">
            Administrator workspace — managing {companyName}. Changes made here
            can affect what the client sees.
          </div>
        ) : null}
      </header>

      <div className="mx-auto flex max-w-[1920px] flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:px-6 lg:py-5">
        <aside className="w-full shrink-0 lg:w-52">
          <p className="mb-3 px-1 text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
            {companyName}
          </p>
          <ClientSidebar basePath={basePath} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
