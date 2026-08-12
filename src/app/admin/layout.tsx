import { AppLayout } from "@/components/shared/app-layout";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <AppLayout
      title=""
      subtitle="Admin portal"
      navigation={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/clients", label: "Clients" },
        { href: "/admin/users", label: "Accounts" },
        { href: "/admin/account", label: "My account" },
      ]}
    >
      {children}
    </AppLayout>
  );
}
