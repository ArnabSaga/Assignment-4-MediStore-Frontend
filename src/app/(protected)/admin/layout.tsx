"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";

import { DashboardShell, type DashboardNavItem } from "@/components/dashboard";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/hooks/use-session";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";
type AdminSessionUser = {
  role?: Role;
  isBanned?: boolean;
};

const adminNavigation: DashboardNavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Boxes,
  },
  {
    href: "/admin/medicines",
    label: "Medicines",
    icon: Package,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { loading, user, refresh } = useSession();

  const role = (user?.role ?? null) as Role | null;
  const isBanned = !!(user as AdminSessionUser | null)?.isBanned;

  React.useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (isBanned || role !== "ADMIN") {
      router.replace("/");
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
      <div className="dashboard-canvas flex min-h-dvh items-center justify-center p-6">
        <div className="dashboard-panel p-6 text-sm text-muted-foreground">
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  if (!user || isBanned || role !== "ADMIN") return null;

  return (
    <DashboardShell
      label="Admin Dashboard"
      user={{
        name: user.name ?? "Admin",
        email: user.email ?? "",
        image: user.image ?? null,
        role: "ADMIN",
      }}
      navigation={adminNavigation}
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  );
}
