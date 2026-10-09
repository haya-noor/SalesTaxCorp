export function FlashMessage({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  if (!success && !error) return null;
  return (
    <p
      className={`mb-5 rounded-lg px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"}`}
      role="status"
    >
      {error ?? success}
    </p>
  );
}
