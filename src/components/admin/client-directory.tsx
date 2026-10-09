"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Database } from "@/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"] & {
  userCount: number;
};

export function ClientDirectory({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return clients.filter(
      (client) =>
        (client.company_name.toLowerCase().includes(normalizedQuery) ||
          client.client_code?.toLowerCase().includes(normalizedQuery)) &&
        (status === "all" || client.status === status),
    );
  }, [clients, query, status]);

  return (
    <div>
      <div className="grid gap-3 border-b border-slate-200 pb-5 dark:border-slate-700 sm:grid-cols-[1fr_auto]">
        <label>
          <span className="sr-only">Search client companies</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search client companies..."
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-950"
          />
        </label>
        <label>
          <span className="sr-only">Filter clients by status</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | "active" | "suspended")
            }
            className="h-12 min-w-44 rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-950 shadow-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:ring-teal-950"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
      </div>

      <div className="mt-2 divide-y divide-slate-200 dark:divide-slate-700">
        {filtered.map((client) => (
          <Link
            href={`/admin/clients/${client.id}`}
            key={client.id}
            className="group flex flex-wrap items-center justify-between gap-5 rounded-xl px-3 py-5 transition hover:bg-teal-50/70 focus-visible:bg-teal-50 dark:hover:bg-slate-800/70 dark:focus-visible:bg-slate-800"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800 dark:text-slate-100 dark:group-hover:text-teal-300">
                  {client.company_name}
                </h3>
                {client.client_code ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    {client.client_code}
                  </span>
                ) : null}
                <StatusBadge status={client.status} />
              </div>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                {client.userCount} portal {client.userCount === 1 ? "user" : "users"}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 shadow-sm transition group-hover:border-teal-300 group-hover:text-teal-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:group-hover:border-teal-500 dark:group-hover:text-teal-300">
              Manage client <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}

        {!filtered.length ? (
          <div className="py-12 text-center">
            <p className="font-semibold text-slate-700 dark:text-slate-200">No matching clients</p>
            <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
              Change the search text or status filter.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
