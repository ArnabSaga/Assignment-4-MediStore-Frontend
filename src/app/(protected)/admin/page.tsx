"use client";

import Link from "next/link";
import * as React from "react";
import { Boxes, Package, ShoppingBag, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DashboardPageHeader,
  DashboardPanel,
  DashboardStatCard,
} from "@/components/dashboard";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";
type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type ApiListResponse<T> = {
  success: boolean;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  data?: T;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBanned: boolean;
  emailVerified: boolean;
  createdAt: string;
};

type Order = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
};

type Category = { id: string; name: string; slug: string };
type Medicine = { id: string; name: string; price: number; createdAt: string };

const API = {
  adminUsers: "/api/v1/admin/users?limit=100&page=1",
  adminOrders: "/api/v1/admin/orders?limit=100&page=1",
  categories: "/api/v1/categories?limit=100&page=1",
  medicines: "/api/v1/medicines?limit=100&page=1",
} as const;

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as { message?: string } | null;

  if (!res.ok) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }

  return json as T;
}

function fmtBDT(amount: number) {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `৳${Math.round(amount)}`;
  }
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [userCount, setUserCount] = React.useState(0);
  const [sellerCount, setSellerCount] = React.useState(0);
  const [customerCount, setCustomerCount] = React.useState(0);
  const [bannedCount, setBannedCount] = React.useState(0);

  const [orderCount, setOrderCount] = React.useState(0);
  const [orderTotals, setOrderTotals] = React.useState<Record<OrderStatus, number>>({
    PLACED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  });
  const [revenue, setRevenue] = React.useState(0);

  const [categoryCount, setCategoryCount] = React.useState(0);
  const [medicineCount, setMedicineCount] = React.useState(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [usersRes, ordersRes, categoriesRes, medicinesRes] = await Promise.all([
        getJSON<ApiListResponse<User[]>>(API.adminUsers),
        getJSON<ApiListResponse<Order[]>>(API.adminOrders),
        getJSON<ApiListResponse<Category[]>>(API.categories),
        getJSON<ApiListResponse<Medicine[]>>(API.medicines),
      ]);

      if (!usersRes.success) {
        throw new Error(usersRes.message || "Failed to load users");
      }
      if (!ordersRes.success) {
        throw new Error(ordersRes.message || "Failed to load orders");
      }
      if (!categoriesRes.success) {
        throw new Error(categoriesRes.message || "Failed to load categories");
      }
      if (!medicinesRes.success) {
        throw new Error(medicinesRes.message || "Failed to load medicines");
      }

      const users = usersRes.data ?? [];
      const orders = ordersRes.data ?? [];
      const categories = categoriesRes.data ?? [];
      const medicines = medicinesRes.data ?? [];

      // Users
      setUserCount(usersRes.meta?.total ?? users.length);
      setSellerCount(users.filter((u) => u.role === "SELLER").length);
      setCustomerCount(users.filter((u) => u.role === "CUSTOMER").length);
      setBannedCount(users.filter((u) => u.isBanned).length);

      // Orders
      setOrderCount(ordersRes.meta?.total ?? orders.length);

      const statusCounts: Record<OrderStatus, number> = {
        PLACED: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      };

      let total = 0;
      for (const o of orders) {
        statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
        total += Number(o.totalAmount || 0);
      }

      setOrderTotals(statusCounts);
      setRevenue(total);

      // Catalogue
      setCategoryCount(categoriesRes.meta?.total ?? categories.length);
      setMedicineCount(medicinesRes.meta?.total ?? medicines.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Overview"
        description="Monitor platform users, catalogue health, and order activity from real MediStore data."
        actions={
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
        }
      />

      {error ? (
        <div className="dashboard-panel border-destructive/30 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {loading ? (
        <div className="dashboard-panel p-6 text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardStatCard
              title="Users"
              value={userCount}
              icon={Users}
              helper={`Loaded sellers: ${sellerCount} · customers: ${customerCount}`}
            />
            <DashboardStatCard
              title="Banned Users"
              value={bannedCount}
              icon={Users}
              helper={`Active from loaded data: ${Math.max(userCount - bannedCount, 0)}`}
            />
            <DashboardStatCard
              title="Orders"
              value={orderCount}
              icon={ShoppingBag}
              helper={`Loaded order value: ${fmtBDT(revenue)}`}
            />
            <DashboardStatCard
              title="Catalogue"
              value={medicineCount}
              icon={Package}
              helper={`Categories: ${categoryCount}`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <DashboardPanel className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Orders by Status</h2>
                  <p className="text-sm text-muted-foreground">
                    Based on the currently loaded admin order response.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(orderTotals) as Array<keyof typeof orderTotals>).map((k) => (
                    <div key={k} className="rounded-xl border bg-background/45 p-3">
                      <p className="text-xs text-muted-foreground">{k}</p>
                      <p className="text-lg font-semibold">{orderTotals[k]}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <Button asChild size="sm" className="btn-primary">
                    <Link href="/admin/orders">Manage Orders</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/admin/users">Manage Users</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/admin/categories">Manage Categories</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/admin/medicines">Manage Medicines</Link>
                  </Button>
                </div>
              </div>
            </DashboardPanel>

            <DashboardPanel>
              <h2 className="text-lg font-semibold">Admin Actions</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border bg-background/45 p-3">
                  <p className="text-sm font-medium">Review Users</p>
                  <p className="text-xs text-muted-foreground">Ban/unban and role changes.</p>
                  <Button asChild size="sm" className="btn-primary mt-2 w-full">
                    <Link href="/admin/users">Open</Link>
                  </Button>
                </div>

                <div className="rounded-xl border bg-background/45 p-3">
                  <p className="text-sm font-medium">Monitor Orders</p>
                  <p className="text-xs text-muted-foreground">Update order status quickly.</p>
                  <Button asChild size="sm" className="mt-2 w-full" variant="outline">
                    <Link href="/admin/orders">Open</Link>
                  </Button>
                </div>
                <div className="rounded-xl border bg-background/45 p-3">
                  <p className="text-sm font-medium">Catalogue</p>
                  <p className="text-xs text-muted-foreground">Categories and medicines.</p>
                  <Button asChild size="sm" className="mt-2 w-full" variant="outline">
                    <Link href="/admin/categories">
                      <Boxes aria-hidden="true" className="mr-2 h-4 w-4" />
                      Open Categories
                    </Link>
                  </Button>
                </div>
              </div>
            </DashboardPanel>
          </div>
        </>
      )}
    </div>
  );
}
