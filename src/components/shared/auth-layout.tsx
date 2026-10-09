/*
This file defines a reusable authentication layout for the SalesTaxCorp application.
It provides a common header with the SalesTaxCorp logo, title, and description,
and a main content area where the login/signup form can be rendered.
*/

import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-shell relative grid min-h-screen place-items-center px-4 py-12 dark:bg-[#0f172a]">
      <ThemeToggle className="absolute right-5 top-5 sm:right-8 sm:top-8" />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">

          <Link
            href="/"
            className="mb-3 inline-block text-sm font-bold uppercase tracking-[0.22em] text-teal-700 hover:text-teal-900"
          >
            Sales Tax Corp
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="font-medium hover:text-slate-900 dark:hover:text-white">
            Return to the public website
          </Link>
        </p>

      </div>
    </main>
  );
}
