"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: Role;
  image?: string | null;
};

type BetterAuthSessionResult =
  | { data: { user: any; session: any } | null; error: null }
  | { data: null; error: { message?: string } };

async function getSessionUser(): Promise<SessionUser | null> {
  const res =
    (await authClient.getSession()) as unknown as BetterAuthSessionResult;

  if (!res || res.error || !res.data?.user) return null;

  const u = res.data.user;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    image: u.image ?? null,
  };
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<SessionUser | null>(null);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      const u = await getSessionUser();

      if (!mounted) return;

      if (!u) {
        // 🔒 Not logged in → redirect to login
        const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
        router.replace(`/login${next}`);
        return;
      }

      setUser(u);
      setLoading(false);
    })().catch(() => {
      if (!mounted) return;
      router.replace("/login");
    });

    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking authentication…
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen overflow-hidden">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-semibold">
              MediStore
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-muted-foreground">
              Welcome,{" "}
              <span className="font-medium text-foreground">{user.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {user.role === "ADMIN" && (
              <Button asChild size="sm" variant="outline">
                <Link href="/admin">Admin</Link>
              </Button>
            )}

            {user.role === "SELLER" && (
              <Button asChild size="sm" variant="outline">
                <Link href="/seller">Seller</Link>
              </Button>
            )}

            <Button asChild size="sm" variant="outline">
              <Link href="/account/profile">Profile</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="h-[calc(100vh-56px)] overflow-hidden">{children}</main>
    </div>
  );
}
