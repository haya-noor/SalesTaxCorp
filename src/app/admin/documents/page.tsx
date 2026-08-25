import { AdminPageHeader } from "@/components/admin/admin-page-header";

import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/field";
import { FlashMessage } from "@/components/shared/flash-message";
import { deleteDocumentAction } from "@/features/admin/documents-actions";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminDocumentsPage({
  searchParams,
}: {

  searchParams: Promise<{ client?: string; success?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("status", "active")
    .order("company_name");

  const clientId = params.client ?? clients?.[0]?.id;

  const { data: documents } = clientId
    ? await supabase
        .from("client_documents")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <div>
      <AdminPageHeader
        title="Documents"
        description="Files uploaded by clients through the portal."
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Documents" }]}
      />
      <FlashMessage {...params} />
      <Card>
        <form className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <SelectField label="Client" name="client" defaultValue={clientId}>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name}
                </option>
              ))}
            </SelectField>
          </div>
          <Button type="submit" variant="secondary">
            Switch
          </Button>
        </form>
      </Card>
      {clientId ? (
        <Card className="mt-6">
          <h2 className="text-xl font-bold">Uploaded documents</h2>
          <div className="mt-4 divide-y divide-slate-200">
            {documents?.map((document) => (
              <div
                key={document.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {document.original_filename}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Uploaded {new Date(document.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/documents/${document.id}/file`}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 shadow-sm hover:border-teal-300"
                  >
                    Download
                  </a>
                  <form action={deleteDocumentAction}>
                    <input type="hidden" name="documentId" value={document.id} />
                    <input type="hidden" name="clientId" value={clientId} />
                    <ConfirmSubmitButton message="Delete this document? This cannot be undone.">
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            ))}
            {!documents?.length ? (
              <p className="py-8 text-center text-base text-slate-500">
                No documents uploaded yet for this client.
              </p>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
