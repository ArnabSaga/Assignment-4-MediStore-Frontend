import { env } from "@/env";

export function apiUrl(path: string) {
  const isServer = typeof window === "undefined";
  const p = path.replace(/^\//, "");

  if (!isServer) {
    return `/api/v1/${p}`;
  }

  const base = env.NEXT_PUBLIC_FRONTEND_URL.endsWith("/")
    ? env.NEXT_PUBLIC_FRONTEND_URL
    : `${env.NEXT_PUBLIC_FRONTEND_URL}/`;

  return `${base}api/v1/${p}`;
}
