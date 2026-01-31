"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Menu,
  Package,
  ShoppingBag,
  LogOut,
} from "lucide-react";

import { useSession } from "@/hooks/use-session";
import { ModeToggle } from "@/components/layout/ModeToggle";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function SidebarNavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-muted text-foreground" : "hover:bg-muted text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function SidebarContent({
  pathname,
  onLogout,
}: {
  pathname: string;
  onLogout: () => void;
}) {
  const isDashboard = pathname === "/seller/dashboard";
  const isMedicines =
    pathname === "/seller/medicines" ||
    pathname.startsWith("/seller/medicines/");
  const isOrders =
    pathname === "/seller/orders" || pathname.startsWith("/seller/orders/");

  return (
    <div className="flex h-full flex-col p-4">
      {/* Header */}
      <div className="mb-3">
        <p className="mb-1 text-sm text-muted-foreground">Seller Panel</p>
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

      <Separator className="my-3" />

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        <SidebarNavItem
          href="/seller/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          active={isDashboard}
        />
        <SidebarNavItem
          href="/seller/medicines"
          icon={Package}
          label="Medicines"
          active={isMedicines}
        />
        <SidebarNavItem
          href="/seller/orders"
          icon={ShoppingBag}
          label="Orders"
          active={isOrders}
        />
      </nav>

      {/* Bottom */}
      <div className="mt-auto">
        {/* Theme toggle */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ModeToggle />
        </div>

        <Separator className="my-3" />

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="btn-outline w-full"
            onClick={() => void onLogout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Separator className="my-3" />

        <div className="flex flex-col gap-2">
          <Button asChild variant="outline" className="w-full btn-outline">
            <Link href="/">Back to Store</Link>
          </Button>

          <Button asChild variant="outline" className="w-full btn-outline">
            <Link href="/account/profile" prefetch={false}>
              My Profile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SellerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const { loading, user, refresh } = useSession();

  const isSellerArea =
    pathname === "/seller" || pathname.startsWith("/seller/");

  const logout = async () => {
    try {
      await authClient.signOut();
    } finally {
      await refresh().catch(() => {});
      router.replace("/login");
    }
  };

  React.useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isSellerArea && user.role !== "SELLER") {
      router.replace("/shop");
      return;
    }
  }, [loading, user, router, pathname, isSellerArea]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading seller panel…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (isSellerArea && user.role !== "SELLER") return null;

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r bg-card/60 backdrop-blur lg:block">
        <SidebarContent pathname={pathname} onLogout={logout} />
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Top Bar */}
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-border bg-card">
              <Image
                src="/icons/logo.png"
                alt="MediStore"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
                priority
              />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Seller Panel
            </span>

            <div className="ml-2 flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="btn-outline"
              >
                <Link href="/">View site</Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="btn-outline"
                onClick={() => void logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="btn-outline">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="p-4">
                <SheetTitle className="flex items-center gap-2">
                  <Image
                    src="/icons/logo.png"
                    alt="MediStore"
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                  />
                  MediStore
                </SheetTitle>
              </SheetHeader>

              <div className="h-[calc(100dvh-64px)]">
                <SidebarContent pathname={pathname} onLogout={logout} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Only main scrolls */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="min-h-full rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
