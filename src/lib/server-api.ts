import type { ApiResponse } from "@/types/api";
import { cookies, headers } from "next/headers";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export async function serverApi<T>(
  path: string,
  opts: { method?: Method; body?: unknown; cache?: RequestCache } = {}
): Promise<T> {
  const cookieStore = await cookies();
  const incomingHeaders = await headers();

  const forwardedHeaders: Record<string, string> = {
    "content-type": "application/json",
    cookie: cookieStore.toString(),
  };

  const headerList = [
    "user-agent",
    "x-forwarded-for",
    "x-forwarded-host",
    "x-forwarded-proto",
    "accept-language",
  ];

  for (const h of headerList) {
    const val = incomingHeaders.get(h);
    if (val) forwardedHeaders[h] = val;
  }

  const proto = forwardedHeaders["x-forwarded-proto"] || "http";
  const host = forwardedHeaders["x-forwarded-host"];

  const base = host
    ? `${proto}://${host}`
    : (process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

  const fullUrl = `${base}/api/v1/${path.replace(/^\//, "")}`;

  const res = await fetch(fullUrl, {
    method: opts.method ?? "GET",
    headers: forwardedHeaders,
    credentials: "include",
    cache: opts.cache ?? "no-store",
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok) {
    const msg = json?.message || `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, json ?? undefined);
  }

  if (!json) {
    throw new ApiError(res.status, "Invalid API response");
  }

  return json.data;
}
