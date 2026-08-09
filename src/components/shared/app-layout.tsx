import Link from "next/link";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";


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
}: {
  title: string;
  subtitle: string;
  navigation: Array<{ href: string; label: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <div>
            <Link href="/" className="font-bold tracking-tight text-slate-950">
              SalesTaxCorp
            </Link>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>

          <nav className="flex flex-wrap items-center gap-1" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}

            <form action={logoutAction}>
              <Button type="submit" variant="ghost">
                Log out
              </Button>
            </form>

          </nav>
        </div>

      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
        </div>
        {children}
      </main>

    </div>
  );
}
