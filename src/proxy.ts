import { NextRequest, NextResponse } from "next/server";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

const SESSION_PATH = "/api/auth/get-session";

type AnySession = {
  user?: { role?: Role };
  data?: { user?: { role?: Role } | null } | null;
};

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/account/:path*",
    "/cart",
    "/checkout/:path*",
  ],
};

async function getRole(req: NextRequest): Promise<Role | null> {
  try {
    const cookie = req.headers.get("cookie") ?? "";

    const backend = process.env.BACKEND_URL;
    const sessionUrl = new URL(SESSION_PATH, backend);

    const res = await fetch(sessionUrl, {
      method: "GET",
      headers: {
        cookie,
        "content-type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = (await res.json().catch(() => null)) as AnySession | null;
    const user = json?.user ?? json?.data?.user;

    return (user?.role ?? null) as Role | null;
  } catch {
    return null;
  }
}

function redirect(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const role = await getRole(req);

  if (!role) return redirectToLogin(req);

  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return role === "SELLER"
        ? redirect(req, "/seller/dashboard")
        : redirect(req, "/shop");
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/seller")) {
    if (role !== "SELLER") {
      return role === "ADMIN"
        ? redirect(req, "/admin")
        : redirect(req, "/shop");
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/account")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}
