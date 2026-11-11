"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderIcon,
  InfoIcon,
  NexusIcon,
  OverviewIcon,
  RegistrationIcon,
  ReportIcon,
} from "@/components/client/portal-icons";

export function portalNavItems(basePath: string) {
  return [
    { href: `${basePath}/overview`, label: "Overview", Icon: OverviewIcon },
    { href: `${basePath}/reports`, label: "Reports", Icon: ReportIcon },
    { href: `${basePath}/registrations`, label: "Registrations", Icon: RegistrationIcon },
    { href: `${basePath}/nexus-study`, label: "Nexus study", Icon: NexusIcon },
    { href: `${basePath}/information`, label: "Information", Icon: InfoIcon },
    { href: `${basePath}/documents`, label: "Documents", Icon: FolderIcon },
  ];
}

/*
Numbered portal navigation. On desktop it is a vertical list in the dark
sidebar; below the lg breakpoint it becomes a horizontally scrolling tab row
so the page content starts right under the header.
*/
export function ClientSidebar({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Client portal navigation"
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {portalNavItems(basePath).map((item, index) => {
        const active =
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`) ||
          (item.href === `${basePath}/overview` && pathname === basePath);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold transition lg:py-3 ${
              active
                ? "bg-white/[0.07] text-white"
                : "text-white/60 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-2 left-0 hidden w-[3px] rounded-full lg:block ${
                active ? "bg-brand-bright" : "bg-transparent"
              }`}
            />
            <span
              className={`font-code text-[11px] tabular-nums ${
                active ? "text-brand-bright" : "text-white/30 group-hover:text-white/50"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <item.Icon
              className={`size-[18px] ${
                active ? "text-brand-bright" : "text-white/45 group-hover:text-white/75"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* Breadcrumb for the portal header: "Client portal / <current section>". */
export function PortalBreadcrumb({ basePath = "/dashboard" }: { basePath?: string }) {
  const pathname = usePathname();
  const current =
    portalNavItems(basePath).find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.label ?? (pathname.endsWith("/account") ? "My account" : "Overview");

  return (
    <p className="hidden items-center gap-2 font-code text-[13px] text-slate-500 lg:flex dark:text-slate-400">
      <span>Client portal</span>
      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">/</span>
      <span className="font-medium text-ink dark:text-slate-100">{current}</span>
    </p>
  );
}
