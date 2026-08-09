import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/shared/auth-layout";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to access your SalesTaxCorp portal."
    >
      <AuthForm mode="login" />
    </AuthLayout>
  );
}
