import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

/*
This file defines two reusable input field components: Field and SelectField.
Field is a generic input field component that can be used for text, email, password, etc.
SelectField is a dropdown select field component that can be used for selecting a value from a list.

*/
export function Field({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="grid gap-2 text-base font-semibold text-slate-700">
      {label}
      <input
        className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <span className="text-sm text-red-700">{error}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-base font-semibold text-slate-700">
      {label}
      <select
        className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
