import Link from "next/link";
import { ClientSidebar } from "@/components/client/client-sidebar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";

/*
Layout shell for the client portal: header with company name/account/logout,
and a left sidebar (Reports, Registrations, Nexus study, Information) with
the page content to its right. Reports is the default landing section.
*/
export function ClientShell({
  companyName,
  children,
}: {
  companyName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-1 bg-gradient-to-r from-teal-700 via-emerald-500 to-teal-700" />
      <header className="border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3 text-slate-950">
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
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8 lg:py-12">
        <aside className="w-full shrink-0 lg:w-64">
          <p className="mb-3 px-1 text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
            {companyName}
          </p>
          <ClientSidebar />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
