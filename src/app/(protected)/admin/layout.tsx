"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  ShieldAlert,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { useSession } from "@/hooks/use-session";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { loading, user, refresh } = useSession();

  const role = (user?.role ?? null) as Role | null;
  const isBanned = !!(user as any)?.isBanned;

  React.useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (isBanned) {
      router.replace("/");
      return;
    }

    if (role !== "ADMIN") {
      router.replace("/");
      return;
    }
  }, [loading, user, role, isBanned, router]);

  const logout = async () => {
    try {
      await authClient.signOut();
    } finally {
      await refresh().catch(() => {});
      router.replace("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen  items-center justify-center p-6">
        <div className="text-sm text-muted-foreground">
          Loading admin panel…
        </div>
      </div>
    );
  }

  if (!user || isBanned || role !== "ADMIN") return null;

  return (
    <div className="h-[calc(100vh-56px)] w-full overflow-hidden">
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <aside className="hidden w-65 shrink-0 border-r bg-background lg:block">
          <div className="flex h-full flex-col p-4 overflow-hidden">
            <div className="mb-4">
              <Link href="/admin" className="flex items-center mb-4 gap-2">
                <ShieldAlert className="h-5 w-5" />
                <span className="font-semibold">Admin Panel</span>
              </Link>

              <div className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-border bg-card">
                  <Image
                    src="/icons/logo.png"
                    alt="MediStore"
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                    priority
                  />
                </span>
                <span className="text-base font-semibold tracking-tight">
                  Medi<span className="text-[#52796f]">Store</span>
                </span>
              </div>
            </div>

            <Separator className="my-2" />

            <nav className="space-y-1">
              <NavLink
                href="/admin"
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Dashboard"
              />
              <NavLink
                href="/admin/users"
                icon={<Users className="h-4 w-4" />}
                label="Users"
              />
              <NavLink
                href="/admin/orders"
                icon={<ShoppingBag className="h-4 w-4" />}
                label="Orders"
              />
              <NavLink
                href="/admin/categories"
                icon={<Package className="h-4 w-4" />}
                label="Categories"
              />
              <NavLink
                href="/admin/medicines"
                icon={<Package className="h-4 w-4" />}
                label="Medicines"
              />
            </nav>

            <div className="mt-auto pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ModeToggle />
              </div>

              <Separator className="my-3" />

              <div className="text-xs text-muted-foreground pb-2">
                Signed in as{" "}
                <span className="font-medium text-foreground">
                  {user?.name}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/">View site</Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 min-w-0 w-full overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
