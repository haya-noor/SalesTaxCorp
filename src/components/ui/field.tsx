import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

/*
This file defines two reusable input field components: Field and SelectField.
Field is a generic input field component that can be used for text, email, password, etc.
SelectField is a dropdown select field component that can be used for selecting a value from a list.

*/
export function Field({
  label,
  error,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="grid gap-2 text-base font-semibold text-slate-700 dark:text-slate-200">
      {label}
      <input
        className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-950"
        aria-invalid={Boolean(error)}
        aria-describedby={
          error || hint ? `${props.name}-supporting-text` : undefined
        }
        {...props}
      />
      {error ? (
        <span id={`${props.name}-supporting-text`} className="text-sm text-red-700 dark:text-red-300">
          {error}
        </span>
      ) : hint ? (
        <span id={`${props.name}-supporting-text`} className="text-sm font-normal text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      ) : null}
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
    <label className="grid gap-2 text-base font-semibold text-slate-700 dark:text-slate-200">
      {label}
      <select
        className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:ring-teal-950"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
