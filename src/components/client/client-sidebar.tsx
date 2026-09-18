"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
export function ClientSidebar({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: `${basePath}/reports`, label: "Reports" },
    { href: `${basePath}/registrations`, label: "Registrations" },
    { href: `${basePath}/nexus-study`, label: "Nexus study" },
    { href: `${basePath}/information`, label: "Information" },
    { href: `${basePath}/documents`, label: "Documents" },
  ];

  return (
    <nav aria-label="Client portal navigation" className="grid gap-1">
      {navItems.map((item, index) => {
        const active =
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`) ||
          (item.href === `${basePath}/reports` && pathname === basePath);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-base font-semibold transition ${
              active
                ? "bg-slate-800 text-white shadow-sm ring-1 ring-inset ring-white/10"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <span
              className={`font-mono text-xs tabular-nums ${
                active ? "text-emerald-400" : "text-slate-600"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            {item.label}
          </Link>
        );
      })}

      <span
        aria-disabled="true"
        className="mt-1 cursor-not-allowed px-3.5 py-2 text-sm font-medium text-slate-600"
      >
        Coming soon
      </span>
    </nav>
  );
}
