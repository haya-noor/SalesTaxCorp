import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/shared/auth-layout";

export const metadata: Metadata = { title: "Create client account" };

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create a client account"
      description="Client registrations remain private until a SalesTaxCorp administrator verifies and assigns the company."
    >
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}
