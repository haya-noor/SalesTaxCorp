import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Card } from "@/components/ui/card";
import { deleteDocumentAction } from "@/features/admin/documents-actions";
import type { Database } from "@/types/database";

type ClientDocument = Database["public"]["Tables"]["client_documents"]["Row"];

export function AdminDocumentList({
  clientId,
  documents,
  workspace = "admin",
}: {
  clientId: string;
  documents: ClientDocument[];
  workspace?: "admin" | "client-portal";
}) {
  return (
    <Card>
      <h2 className="text-xl font-bold">Uploaded documents</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {documents.map((document) => (
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
                <input type="hidden" name="workspace" value={workspace} />
                <ConfirmSubmitButton message="Delete this document? This cannot be undone.">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {!documents.length ? (
          <p className="py-8 text-center text-base text-slate-500">
            No documents uploaded yet for this client.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
