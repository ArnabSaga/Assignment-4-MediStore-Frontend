import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

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

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: backendRes.headers,
  });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
