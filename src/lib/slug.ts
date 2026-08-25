// Builds the base for a readable client code from a person's full name,
// e.g. "John Q. Smith" -> "johnsmith". A numeric suffix is appended by the
// caller to make it unique (see ensureClientCode in features/admin/actions.ts).
export function slugifyFullName(fullName: string): string {
  const words = fullName
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
    .filter(Boolean);

  if (words.length === 0) return "client";
  if (words.length === 1) return words[0];

  return words[0] + words[words.length - 1];
}
