import { AppLayout } from "@/components/shared/app-layout";
import { requireClientUser } from "@/lib/auth/guards";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { client } = await requireClientUser();
  return (
    <AppLayout
      title={client.company_name}
      subtitle="Client portal"
      navigation={[
        { href: "/dashboard", label: "Dashboard" },
        { href: "/dashboard/reports", label: "Reports" },
        { href: "/dashboard/account", label: "Account" },
      ]}
    >
      {children}
    </AppLayout>
  );
}
