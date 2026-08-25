import { ComingSoonCard } from "@/components/client/coming-soon-card";
import { requireClientUser } from "@/lib/auth/guards";

export default async function NexusStudyPage() {
  await requireClientUser();

  return <ComingSoonCard title="Nexus study" />;
}
