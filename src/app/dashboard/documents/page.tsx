import { UploadIcon } from "@/components/client/portal-icons";
import { PortalPage, portalButton, portalCard } from "@/components/client/portal-page";
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
    <PortalPage
      eyebrow="Documents"
      title="Send a document"
      description="Share a state notice, invoice or any other file with your account manager. They'll review it and follow up if anything else is needed."
      notice={<FlashMessage {...params} />}
    >
      <form
        action={uploadDocumentAction}
        encType="multipart/form-data"
        className={portalCard("max-w-2xl p-5 sm:p-6")}
      >
        <label className="group grid cursor-pointer place-items-center gap-3 rounded-xl border-2 border-dashed border-line bg-paper/60 px-6 py-10 text-center transition hover:border-brand/60 hover:bg-brand-wash/40 dark:border-slate-600 dark:bg-slate-800/40 dark:hover:border-brand-bright/60">
          <span className="grid size-12 place-items-center rounded-xl bg-white text-brand shadow-sm dark:bg-slate-900 dark:text-brand-bright">
            <UploadIcon className="size-6" />
          </span>
          <span>
            <span className="block font-heading text-lg font-semibold text-ink dark:text-slate-50">
              Choose a file to upload
            </span>
            <span className="mt-1 block text-sm text-ink-faint dark:text-slate-400">
              PDFs, spreadsheets and images all work.
            </span>
          </span>
          <input
            type="file"
            name="file"
            required
            className="w-full max-w-sm rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-brand-wash file:px-3 file:py-1.5 file:font-semibold file:text-brand-deep dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:file:bg-emerald-950 dark:file:text-emerald-200"
          />
        </label>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-ink-faint dark:text-slate-400">
            Files are stored privately and only visible to you and our team.
          </p>
          <button type="submit" className={portalButton.primary}>
            <UploadIcon className="size-4" />
            Upload document
          </button>
        </div>
      </form>
    </PortalPage>
  );
}
