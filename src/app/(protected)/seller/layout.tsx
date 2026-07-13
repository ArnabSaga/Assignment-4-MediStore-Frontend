"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";

import { DashboardShell, type DashboardNavItem } from "@/components/dashboard";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/hooks/use-session";

const sellerNavigation: DashboardNavItem[] = [
  {
    href: "/seller/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/seller/medicines",
    label: "Medicines",
    icon: Package,
  },
  {
    href: "/seller/orders",
    label: "Orders",
    icon: ShoppingBag,
  },
];

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
    }
  }, [loading, user, router, pathname, isSellerArea]);

  if (loading) {
    return (
      <div className="dashboard-canvas flex min-h-dvh items-center justify-center p-6">
        <div className="dashboard-panel p-6 text-sm text-muted-foreground">
          Loading seller dashboard...
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (isSellerArea && user.role !== "SELLER") return null;

  return (
    <DashboardShell
      label="Seller Dashboard"
      user={{
        name: user.name ?? "Seller",
        email: user.email ?? "",
        image: user.image ?? null,
        role: "SELLER",
      }}
      navigation={sellerNavigation}
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  );
}
