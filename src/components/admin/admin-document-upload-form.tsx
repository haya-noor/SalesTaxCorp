import { Button } from "@/components/ui/button";
import { uploadAdminDocumentAction } from "@/features/admin/documents-actions";

export function AdminDocumentUploadForm({ clientId }: { clientId: string }) {
  return (
    <form
      action={uploadAdminDocumentAction}
      encType="multipart/form-data"
      className="mt-5 grid gap-4"
    >
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="workspace" value="client-portal" />
      <label className="grid gap-2 text-base font-semibold text-slate-700">
        File
        <input
          type="file"
          name="file"
          required
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 shadow-sm"
        />
      </label>
      <div>
        <Button type="submit">Upload document</Button>
      </div>
    </form>
  );
}
