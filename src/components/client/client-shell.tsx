import Link from "next/link";
import { ClientSidebar } from "@/components/client/client-sidebar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";

/*
Layout shell for the client portal: header with company name/account/logout,
and a left sidebar (Reports, Registrations, Nexus study, Information,
Documents) with the page content to its right. Reports is the default
landing section.

When `preview` is set, this renders the same chrome for an admin looking at
a client's portal read-only: the account/logout header links are replaced
with an "Exit preview" link back to the admin client page, a banner makes
clear this is a preview, and the sidebar links are rooted at `basePath`
instead of /dashboard.
*/
export function ClientShell({
  companyName,
  basePath = "/dashboard",
  preview,
  exitHref,
  documentsHref,
  children,
}: {
  companyName: string;
  basePath?: string;
  preview?: boolean;
  exitHref?: string;
  documentsHref?: string;
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
            {preview ? (
              <Link
                href={exitHref ?? "/admin/clients"}
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-base font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Exit preview
              </Link>
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

        {preview ? (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-800 sm:px-6 lg:px-8">
            Read-only preview — viewing the portal as {companyName} sees it.
          </div>
        ) : null}
      </header>

      <div className="mx-auto flex max-w-[1920px] flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:px-6 lg:py-5">
        <aside className="w-full shrink-0 lg:w-52">
          <p className="mb-3 px-1 text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
            {companyName}
          </p>
          <ClientSidebar basePath={basePath} preview={preview} documentsHref={documentsHref} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
