"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/hooks/use-session";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { loading, user } = useSession();

  React.useEffect(() => {
    if (loading) return;

    if (!user) {
      const next =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : (pathname ?? "/");

      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [loading, user, router, pathname]);

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

  const role = (user.role ?? null) as Role | null;

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
              <span className="font-medium text-foreground">
                {user.name ?? "User"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {role === "ADMIN" && (
              <Button asChild size="sm" variant="outline">
                <Link href="/admin">Admin</Link>
              </Button>
            )}

            {role === "SELLER" && (
              <Button asChild size="sm" variant="outline">
                <Link href="/seller/dashboard">Seller</Link>
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
