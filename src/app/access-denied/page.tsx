import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/shared/auth-layout";
import { logoutAction } from "@/features/auth/actions";

export default function AccessDeniedPage() {
  return (
    <AuthLayout
      title="Access unavailable"
      description="This account does not currently have access to the requested portal area. Contact SalesTaxCorp if you believe this is a mistake."
    >
      <form action={logoutAction}>
        <Button type="submit" variant="secondary" className="w-full">
          Return to sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
