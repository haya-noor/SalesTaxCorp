/*
This file defines a reusable authentication layout for the SalesTaxCorp application.
It provides a common header with the SalesTaxCorp logo, title, and description,
and a main content area where the login/signup form can be rendered.
*/

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
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-teal-700">
            SalesTaxCorp
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          {children}
        </div>

      </div>
    </main>
  );
}
