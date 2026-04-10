import {
  createProxyErrorResponse,
  getBackendUrlOrThrow,
  getFilteredProxyHeaders,
  sanitizeProxyResponseHeaders,
} from "@/lib/api-proxy";
import { NextRequest, NextResponse } from "next/server";

function rewriteSetCookie(value: string, req: NextRequest) {
  let rewritten = value.replace(/;\s*Path=[^;]*/i, "; Path=/");

  const proto = req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");

  if (proto !== "https") {
    rewritten = rewritten.replace(/;\s*Secure/gi, "");
  }

  return rewritten;
}

async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const backendUrl = getBackendUrlOrThrow();
    const { path } = await context.params;

    const incomingUrl = new URL(req.url);
    const target = new URL(`/api/auth/${path.join("/")}`, backendUrl);
    target.search = incomingUrl.search;

    // Temporary diagnostic logging (caution: no sensitive data)
    console.log(
      `[Proxy] Auth Request: ${req.method} ${incomingUrl.pathname} -> ${target.origin}${target.pathname}`
    );

    // 1. Filtered Header Proxying
    const filteredHeaders = getFilteredProxyHeaders(req.headers);
    const headers = new Headers(filteredHeaders);

    // Ensure essential proxy headers are set if missing from client
    if (!headers.has("x-forwarded-host")) {
      headers.set("x-forwarded-host", incomingUrl.host);
    }
    if (!headers.has("x-forwarded-proto")) {
      headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));
    }

    const body =
      req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();

    const backendRes = await fetch(target.toString(), {
      method: req.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    console.log(`[Proxy] Auth Response: ${backendRes.status} from ${target.pathname}`);

    // 2. Sanitize Response Headers (Fixes ERR_CONTENT_DECODING_FAILED)
    const outHeaders = sanitizeProxyResponseHeaders(backendRes.headers);

    // 2. Preserve Cookie Fidelity (Pass-through Rules)
    const setCookies: string[] =
      (backendRes.headers as any).getSetCookie?.() ??
      (outHeaders.get("set-cookie") ? [outHeaders.get("set-cookie")!] : []);

    if (setCookies.length) {
      outHeaders.delete("set-cookie");
      for (const cookieValue of setCookies) {
        if (!cookieValue) continue;
        outHeaders.append("set-cookie", rewriteSetCookie(cookieValue, req));
      }
    }

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: outHeaders,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("BACKEND_URL")) {
      return createProxyErrorResponse(500, "Frontend transport misconfiguration.", error);
    }
    return createProxyErrorResponse(502, "Backend service is currently unreachable.", error);
  }
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
