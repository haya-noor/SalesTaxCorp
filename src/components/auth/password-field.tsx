"use client";

import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  error?: string;
  hint?: string;
};

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path strokeLinecap="round" d="m3 3 18 18" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 6 9 6a16.7 16.7 0 0 1-2.1 2.8M6.6 6.6C4.2 8.1 3 10 3 10s3.5 6 9 6c1.2 0 2.3-.3 3.3-.7"
      />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function PasswordField({
  label,
  error,
  hint,
  className,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const generatedInputId = useId();
  const supportingTextId = useId();
  const inputId = props.id ?? generatedInputId;

  return (
    <div className="grid gap-2 text-base font-semibold text-slate-700">
      <label htmlFor={inputId}>{label}</label>
      <span className="relative block">
        <input
          id={inputId}
          className={`h-12 w-full rounded-xl border border-slate-300 bg-white py-0 pl-4 pr-12 text-base text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100 ${className ?? ""}`}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? supportingTextId : undefined}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-1 flex w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          title={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
        >
          <EyeIcon hidden={visible} />
        </button>
      </span>
      {error ? (
        <span id={supportingTextId} className="text-sm text-red-700">
          {error}
        </span>
      ) : hint ? (
        <span
          id={supportingTextId}
          className="text-sm font-normal text-slate-500"
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}
