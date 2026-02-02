import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

function rewriteSetCookie(value: string, req: NextRequest) {
  let v = value.replace(/;\s*Path=[^;]*/i, "; Path=/");

  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  if (proto !== "https") {
    v = v.replace(/;\s*Secure/gi, "");
  }

  return v;
}

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;

  const url = new URL(req.url);
  const target = new URL(`${BACKEND_URL}/api/auth/${path.join("/")}`);
  target.search = url.search;

  const headers = new Headers(req.headers);

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

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

  const setCookies: string[] =
    (backendRes.headers as any).getSetCookie?.() ??
    (outHeaders.get("set-cookie") ? [outHeaders.get("set-cookie")!] : []);

  if (setCookies.length) {
    outHeaders.delete("set-cookie");
    for (const sc of setCookies) {
      if (!sc) continue;
      outHeaders.append("set-cookie", rewriteSetCookie(sc, req));
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
