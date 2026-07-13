export function getSafeNext(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (!value) return fallback;

  const candidate = value.trim();

  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(candidate)
  ) {
    return fallback;
  }

  return candidate;
}
