import { NextRequest, NextResponse } from "next/server";

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

  const url = new URL(req.url);
  const target = new URL(`${BACKEND_URL}/api/v1/${path.join("/")}`);
  target.search = url.search;

  const headers = new Headers(req.headers);

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  // Remove host header to prevent backend rejection
  headers.delete("host");

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  const backendRes = await fetch(target.toString(), {
    method: req.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const outHeaders = new Headers(backendRes.headers);

  // Extract and rewrite set-cookie headers
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
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
