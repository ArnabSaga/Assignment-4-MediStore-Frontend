import { env } from "@/env";

export function apiUrl(path: string) {
  const base = env.NEXT_PUBLIC_API_URL.endsWith("/")
    ? env.NEXT_PUBLIC_API_URL
    : `${env.NEXT_PUBLIC_API_URL}/`;
  const p = path.replace(/^\//, "");
  return new URL(p, base).toString();
}
