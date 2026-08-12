"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, signupAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { INITIAL_ACTION_STATE } from "@/types/actions";
import {
  PASSWORD_PATTERN,
  PASSWORD_REQUIREMENTS,
} from "@/lib/password-policy";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Please wait…" : label}
    </Button>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-4">
      {mode === "signup" ? (
        <>
          <Field
            label="Full name"
            name="fullName"
            autoComplete="name"
            required
            error={errors.fullName?.[0]}
          />
          <Field
            label="Company name"
            name="companyName"
            autoComplete="organization"
            required
            error={errors.companyName?.[0]}
          />
        </>
      ) : null}

      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.[0]}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        required
        minLength={mode === "signup" ? 8 : undefined}
        maxLength={mode === "signup" ? 72 : undefined}
        pattern={mode === "signup" ? PASSWORD_PATTERN : undefined}
        title={mode === "signup" ? PASSWORD_REQUIREMENTS : undefined}
        hint={PASSWORD_REQUIREMENTS}
        error={errors.password?.[0]}
      />
      {mode === "signup" ? (
        <Field
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          pattern={PASSWORD_PATTERN}
          title={PASSWORD_REQUIREMENTS}
          required
          error={errors.confirmPassword?.[0]}
        />
      ) : null}

      {state.message ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}

      <SubmitButton label={mode === "login" ? "Sign in" : "Create account"} />

      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? "Need client access?" : "Already registered?"}{" "}
        <Link
          href={mode === "login" ? "/signup" : "/login"}
          className="font-semibold text-teal-700 hover:text-teal-800"
        >
          {mode === "login" ? "Create a client account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
