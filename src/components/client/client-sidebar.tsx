"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/registrations", label: "Registrations" },
  { href: "/dashboard/nexus-study", label: "Nexus study" },
  { href: "/dashboard/information", label: "Information" },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Client portal navigation" className="grid gap-2">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`) ||
          (item.href === "/dashboard/reports" && pathname === "/dashboard");

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-xl px-4 py-3 text-base font-semibold transition ${
              active
                ? "bg-teal-700 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      {[1, 2].map((placeholder) => (
        <span
          key={placeholder}
          aria-disabled="true"
          className="cursor-not-allowed rounded-xl px-4 py-3 text-base font-semibold text-slate-400"
        >
          Coming soon
        </span>
      ))}
    </nav>
  );
}
