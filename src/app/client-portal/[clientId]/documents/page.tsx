import { AdminDocumentList } from "@/components/admin/admin-document-list";
import { AdminDocumentUploadForm } from "@/components/admin/admin-document-upload-form";
import { FlashMessage } from "@/components/shared/flash-message";
import { Card } from "@/components/ui/card";
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
    <div className="grid gap-4">
      <FlashMessage {...messages} />
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="font-bold text-amber-900">Administrator document access</p>
        <p className="mt-1 text-sm leading-6 text-amber-800">
          Upload files for this client, or view, download, and permanently
          delete existing files.
        </p>
      </div>
      <Card>
        <h2 className="text-xl font-bold">Upload a document</h2>
        <p className="mt-1 text-base text-slate-500">
          Add a document directly to this client&apos;s private document storage.
        </p>
        <AdminDocumentUploadForm clientId={client.id} />
      </Card>
      <AdminDocumentList
        clientId={client.id}
        documents={documents ?? []}
        workspace="client-portal"
      />
    </div>
  );
}
