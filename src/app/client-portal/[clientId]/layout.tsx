import { ClientShell } from "@/components/client/client-shell";
import { requireAdminClientView } from "@/lib/auth/guards";

/*
Administrator workspace for a selected client's portal. Deliberately lives
outside src/app/admin so it renders only the client-facing ClientShell
chrome, not the admin nav (mirrors how /dashboard sits outside /admin).
Access is still admin-gated via requireAdminClientView.
*/
export default async function ClientPortalPreviewLayout({
  params,
  children,
}: {
  params: Promise<{ clientId: string }>;
  children: React.ReactNode;
}) {
  const { clientId } = await params;
  const { client } = await requireAdminClientView(clientId);

  return (
    <ClientShell
      companyName={client.company_name}
      basePath={`/client-portal/${clientId}`}
      adminMode
      exitHref={`/admin/clients/${clientId}`}
    >
      {children}
    </ClientShell>
  );
}
