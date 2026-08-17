import { ClientShell } from "@/components/client/client-shell";
import { requireClientUser } from "@/lib/auth/guards";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { client } = await requireClientUser();
  return <ClientShell companyName={client.company_name}>{children}</ClientShell>;
}
