
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlashMessage } from "@/components/shared/flash-message";
import { uploadDocumentAction } from "@/features/client/documents-actions";
import { requireClientUser } from "@/lib/auth/guards";
export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  await requireClientUser();
  const params = await searchParams;

  return (
    <div>
      <FlashMessage {...params} />

      <Card>
        <h2 className="text-xl font-bold">Upload a document</h2>
        <p className="mt-1 text-base text-slate-500">
          Send a file to your account manager. They&apos;ll review it and
          follow up if anything else is needed.
        </p>
        <form
          action={uploadDocumentAction}
          encType="multipart/form-data"
          className="mt-5 grid gap-4"
        >
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
            <Button type="submit">Upload</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
