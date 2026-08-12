"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function PortalNavigation({
  navigation,
}: {
  navigation: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5"
      aria-label="Main navigation"
    >
      {navigation.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin" &&
            item.href !== "/dashboard" &&
            pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3.5 py-2.5 text-[15px] font-semibold transition ${
              active
                ? "bg-white text-teal-800 shadow-sm ring-1 ring-slate-200"
                : "text-slate-600 hover:bg-white hover:text-teal-800 hover:shadow-sm"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      <form action={logoutAction}>
        <Button type="submit" variant="ghost" className="min-h-10">
          Log out
        </Button>
      </form>
    </nav>
  );
}
