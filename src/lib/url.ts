/**
 * Generates an API URL for the V1 backend.
 * Returns a browser-relative path to ensure consistency across environments.
 */
export function apiUrl(path: string): string {
  const p = path.replace(/^\//, "");
  return `/api/v1/${p}`;
}

