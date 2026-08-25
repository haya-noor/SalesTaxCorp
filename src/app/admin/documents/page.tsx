import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("status", "active")
    .order("company_name");

  const clientId = params.client ?? clients?.[0]?.id;
  const selectedClient = clients?.find((c) => c.id === clientId);

  const { data: documents } = clientId
    ? await supabase
        .from("client_documents")
        .select("*")
        .eq("client_id", clientId)
        .order("uploaded_at", { ascending: false })
    : { data: null };

  return (
    <div>
      <AdminPageHeader
        title="Documents"
        description="Files uploaded by clients through the portal."
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Documents" }]}
      />

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

      {clientId && selectedClient ? (
        <Card className="mt-6">
          <h2 className="text-xl font-bold">Uploaded documents</h2>

          {documents?.length ? (
            <div className="mt-4 divide-y divide-slate-200">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{doc.file_name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {(doc.file_size / 1024).toFixed(2)} KB • Uploaded{" "}
                      {new Date(doc.uploaded_at).toLocaleDateString()}{" "}
                      {new Date(doc.uploaded_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Button variant="secondary" asChild>
                    <a
                      href={`/api/documents/${doc.id}/download`}
                      download={doc.file_name}
                    >
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-base text-slate-500">
              No documents uploaded yet by {selectedClient.company_name}.
            </p>
          )}
        </Card>
      ) : null}
    </div>
  );
}
