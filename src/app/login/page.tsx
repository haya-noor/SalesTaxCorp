import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/shared/auth-layout";
import { FlashMessage } from "@/components/shared/flash-message";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const messages = await searchParams;

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to access your SalesTaxCorp portal."
    >
      <FlashMessage {...messages} />
      <AuthForm mode="login" />
    </AuthLayout>
  );
}
