import { NextRequest, NextResponse } from "next/server";
import { getFilteredProxyHeaders, createBadGatewayResponse } from "@/lib/api-proxy";

const BACKEND_URL = process.env.BACKEND_URL!;

function rewriteSetCookie(value: string, req: NextRequest) {
  // Ensure Path is root for the frontend
  let rewritten = value.replace(/;\s*Path=[^;]*/i, "; Path=/");

  const proto = req.headers.get("x-forwarded-proto") || new URL(req.url).protocol.replace(":", "");

  // Remove Secure flag if not running on HTTPS (primarily for local dev)
  if (proto !== "https") {
    rewritten = rewritten.replace(/;\s*Secure/gi, "");
  }

  return rewritten;
}

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;

  const incomingUrl = new URL(req.url);
  const target = new URL(`${BACKEND_URL}/api/v1/${path.join("/")}`);
  target.search = incomingUrl.search;

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
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  try {
    const backendRes = await fetch(target.toString(), {
      method: req.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    const outHeaders = new Headers(backendRes.headers);

    // 2. Preserve Cookie Fidelity
    const setCookies: string[] =
      (backendRes.headers as any).getSetCookie?.() ||
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
    return createBadGatewayResponse(error);
  }
}


export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
