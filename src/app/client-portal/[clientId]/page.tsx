import { redirect } from "next/navigation";

export default async function ClientPortalPreviewIndexPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  redirect(`/client-portal/${clientId}/reports`);
}
