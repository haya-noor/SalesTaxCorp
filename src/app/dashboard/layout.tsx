import { ClientShell } from "@/components/client/client-shell";
import { requireClientUser } from "@/lib/auth/guards";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { client, supabase } = await requireClientUser();
  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .eq("client_id", client.id)
    .eq("status", "active")
    .order("display_name");

  return (
    <ClientShell companyName={client.company_name} stores={stores ?? []}>
      {children}
    </ClientShell>
  );
}
