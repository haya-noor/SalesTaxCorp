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
    <nav aria-label="Client portal navigation" className="grid gap-2">
      {navItems.map((item) => {
        const active =
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`) ||
          (item.href === `${basePath}/reports` && pathname === basePath);

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

      <span
        aria-disabled="true"
        className="cursor-not-allowed rounded-xl px-4 py-3 text-base font-semibold text-slate-400"
      >
        Coming soon
      </span>
    </nav>
  );
}
