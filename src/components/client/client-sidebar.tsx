"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { StoreSwitcher } from "@/components/client/store-switcher";
import type { Database } from "@/types/database";

type Store = Database["public"]["Tables"]["stores"]["Row"];

const NAV_ITEMS = [
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/registrations", label: "Registrations" },
  { href: "/dashboard/nexus-study", label: "Nexus study" },
  { href: "/dashboard/information", label: "Information" },
  { href: "/dashboard/documents", label: "Documents" },
];

export function ClientSidebar({ stores }: { stores: Store[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedStoreId = searchParams.get("store");
  const selectedStoreId = stores.some((store) => store.id === requestedStoreId)
    ? requestedStoreId!
    : stores[0]?.id;

  return (
    <div>
      {stores.length ? (
        <div className="mb-4 border-b border-slate-200 pb-4">
          <StoreSwitcher
            stores={stores}
            selectedStoreId={selectedStoreId}
            action={pathname}
          />
        </div>
      ) : null}

      <nav aria-label="Client portal navigation" className="grid gap-2">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.href === "/dashboard/reports" && pathname === "/dashboard");
          const href = selectedStoreId
            ? `${item.href}?store=${encodeURIComponent(selectedStoreId)}`
            : item.href;

          return (
            <Link
              key={item.href}
              href={href}
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
    </div>
  );
}
