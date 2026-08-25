import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlashMessage } from "@/components/shared/flash-message";
import { requireClientUser } from "@/lib/auth/guards";
import { uploadDocumentAction } from "@/features/client/documents-actions";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { client, supabase } = await requireClientUser();
  const params = await searchParams;

  const { data: documents } = await supabase
    .from("client_documents")
    .select("*")
    .eq("client_id", client.id)
    .order("uploaded_at", { ascending: false });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Documents</h1>
        <p className="mt-2 text-base text-slate-600">
          Upload documents to share with your account manager.
        </p>
      </div>

      <FlashMessage {...params} />

      <Card>
        <h2 className="text-xl font-bold">Upload a document</h2>
        <p className="mt-1 text-base text-slate-500">
          Send a file to your account manager. They'll review it and follow up if anything else is needed.
        </p>

        <form action={uploadDocumentAction} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-base font-semibold text-slate-700">
            File
            <input
              type="file"
              name="file"
              required
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 shadow-sm file:mr-4 file:rounded-lg file:border-0 file:bg-teal-700 file:px-4 file:py-2 file:text-white file:font-semibold"
            />
          </label>
          <Button
            type="submit"
            onClick={(e) => {
              const button = e.currentTarget;
              button.disabled = true;
              button.textContent = "Uploading...";
            }}
          >
            Upload
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Your uploads</h2>

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
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-base text-slate-500">No documents uploaded yet.</p>
        )}
      </Card>
    </div>
  );
}
