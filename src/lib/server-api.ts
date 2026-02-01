import { cookies } from "next/headers";
import type { ApiResponse } from "@/types/api";
import { apiUrl } from "@/lib/url";

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
  const cookie = cookieStore.toString(); 

  const res = await fetch(apiUrl(path), {
    method: opts.method ?? "GET",
    headers: {
      "content-type": "application/json",
      cookie,
    },
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
