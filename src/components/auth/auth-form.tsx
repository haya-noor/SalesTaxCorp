"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, signupAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { INITIAL_ACTION_STATE } from "@/types/actions";

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
        error={errors.password?.[0]}
      />
      {mode === "signup" ? (
        <Field
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
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
        {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
        <Link
          href={mode === "login" ? "/signup" : "/login"}
          className="font-semibold text-teal-700 hover:text-teal-800"
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
