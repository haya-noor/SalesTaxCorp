import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/shared/auth-layout";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Your account will remain private until a SalesTaxCorp administrator verifies it."
    >
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}
