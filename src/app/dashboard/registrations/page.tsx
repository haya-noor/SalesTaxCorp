import { ComingSoonCard } from "@/components/client/coming-soon-card";
import { requireClientUser } from "@/lib/auth/guards";

export default async function RegistrationsPage() {
  await requireClientUser();

  return <ComingSoonCard title="Registrations" />;
}
