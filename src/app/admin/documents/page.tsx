import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminDocumentList } from "@/components/admin/admin-document-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/field";
import { FlashMessage } from "@/components/shared/flash-message";
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
        <div className="mt-6">
          <AdminDocumentList
            clientId={clientId}
            documents={documents ?? []}
          />
        </div>
      ) : null}
    </div>
  );
}
