"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePasswordAction } from "@/features/auth/actions";
import { INITIAL_ACTION_STATE } from "@/types/actions";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/password-field";
import {
  PASSWORD_PATTERN,
  PASSWORD_REQUIREMENTS,
} from "@/lib/password-policy";

function ChangePasswordButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Changing password..." : "Change password"}
    </Button>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(
    changePasswordAction,
    INITIAL_ACTION_STATE,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="mt-6 grid max-w-lg gap-4">
      <PasswordField
        label="Current password"
        name="currentPassword"
        autoComplete="current-password"
        required
        error={errors.currentPassword?.[0]}
      />
      <PasswordField
        label="New password"
        name="newPassword"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        pattern={PASSWORD_PATTERN}
        title={PASSWORD_REQUIREMENTS}
        hint={PASSWORD_REQUIREMENTS}
        required
        error={errors.newPassword?.[0]}
      />
      <PasswordField
        label="Confirm new password"
        name="confirmPassword"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        pattern={PASSWORD_PATTERN}
        title={PASSWORD_REQUIREMENTS}
        required
        error={errors.confirmPassword?.[0]}
      />

      {state.message ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}

      <div>
        <ChangePasswordButton />
      </div>
    </form>
  );
}
