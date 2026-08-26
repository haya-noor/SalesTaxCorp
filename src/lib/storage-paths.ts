const CLIENT_CODE_PATTERN = /^[a-z0-9]+$/;

function requireStorageClientCode(clientCode: string): string {
  const normalized = clientCode.trim().toLowerCase();

  if (!CLIENT_CODE_PATTERN.test(normalized)) {
    throw new Error("A valid client code is required for Storage paths.");
  }

  return normalized;
}

function sanitizeStorageFilename(filename: string): string {
  const basename = filename.split(/[\\/]/).at(-1)?.trim() ?? "";
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+\./g, ".")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "document";
}

export function buildReportStoragePath(
  clientCode: string,
  year: number,
  month: number,
): string {
  const code = requireStorageClientCode(clientCode);
  const paddedMonth = String(month).padStart(2, "0");
  return `${code}/${year}-${paddedMonth}.html`;
}

export function buildDocumentStoragePath(
  clientCode: string,
  filename: string,
  uploadedAt = Date.now(),
): string {
  const code = requireStorageClientCode(clientCode);
  const safeFilename = sanitizeStorageFilename(filename);
  return `${code}/${uploadedAt}-${safeFilename}`;
}
