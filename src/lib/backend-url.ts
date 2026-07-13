export function getBackendURL(): string {
  const isVercel = process.env.VERCEL === "1" || !!process.env.NEXT_PUBLIC_VERCEL_ENV;
  const isLocal = !isVercel;

  const configured = isLocal
    ? process.env.LOCAL_BACKEND_URL || "http://localhost:5000"
    : process.env.BACKEND_URL;

  if (!configured) {
    throw new Error("BACKEND_URL is required to configure API rewrites.");
  }

  return configured.replace(/\/+$/, "");
}
