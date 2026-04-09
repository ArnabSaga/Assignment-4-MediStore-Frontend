import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

function rewriteSetCookie(value: string, req: NextRequest) {
  let rewritten = value.replace(/;\s*Path=[^;]*/i, "; Path=/");

  const proto = req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");

  if (proto !== "https") {
    rewritten = rewritten.replace(/;\s*Secure/gi, "");
  }

  return rewritten;
}

async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;

  const incomingUrl = new URL(req.url);
  const target = new URL(`${BACKEND_URL}/api/auth/${path.join("/")}`);
  target.search = incomingUrl.search;

  const headers = new Headers();

  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  // Forward essential headers
  const origin = req.headers.get("origin") || incomingUrl.origin;
  headers.set("origin", origin);
  
  const referer = req.headers.get("referer") || `${origin}/`;
  headers.set("referer", referer);

  // Identity headers for the backend
  headers.set("x-forwarded-host", incomingUrl.host);
  headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));

  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();

  const backendRes = await fetch(target.toString(), {
    method: req.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const outHeaders = new Headers(backendRes.headers);

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
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
