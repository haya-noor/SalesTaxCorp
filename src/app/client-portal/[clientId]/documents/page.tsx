import { AdminDocumentList } from "@/components/admin/admin-document-list";
import { FlashMessage } from "@/components/shared/flash-message";
import { requireAdminClientView } from "@/lib/auth/guards";

export default async function ClientPortalDocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { clientId } = await params;
  const { supabase, client } = await requireAdminClientView(clientId);
  const messages = await searchParams;
  const { data: documents } = await supabase
    .from("client_documents")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <FlashMessage {...messages} />
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="font-bold text-amber-900">Administrator document access</p>
        <p className="mt-1 text-sm leading-6 text-amber-800">
          Client uploads are private. Only administrators can view, download,
          or permanently delete them.
        </p>
      </div>
      <AdminDocumentList
        clientId={client.id}
        documents={documents ?? []}
        workspace="client-portal"
      />
    </div>
  );
}
