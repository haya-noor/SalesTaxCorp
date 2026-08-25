import { ComingSoonCard } from "@/components/client/coming-soon-card";
import { requireAdminClientView } from "@/lib/auth/guards";

export default async function ClientPortalPreviewRegistrationsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  await requireAdminClientView(clientId);

  return <ComingSoonCard title="Registrations" />;
}
