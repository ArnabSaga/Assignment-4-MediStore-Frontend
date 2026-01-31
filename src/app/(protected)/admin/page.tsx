"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";
type OrderStatus =
  | "PLACED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type ApiResponse<T> = { success: boolean; message?: string; data?: T };
type ApiListResponse<T> = {
  success: boolean;
  message?: string;
  meta?: { page?: number; limit?: number };
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
  adminUsers: "/api/v1/admin/users",
  adminOrders: "/api/v1/admin/orders?limit=1000&page=1",
  categories: "/api/v1/categories",
  medicines: "/api/v1/medicines?limit=1000&page=1",
} as const;

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as any;

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
  const [orderTotals, setOrderTotals] = React.useState<
    Record<OrderStatus, number>
  >({
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
      const [usersRes, ordersRes, categoriesRes, medicinesRes] =
        await Promise.all([
          getJSON<ApiResponse<User[]>>(API.adminUsers),
          getJSON<ApiListResponse<Order[]>>(API.adminOrders),
          getJSON<ApiResponse<Category[]>>(API.categories),
          getJSON<ApiListResponse<Medicine[]>>(API.medicines),
        ]);

      if (!usersRes.success)
        throw new Error(usersRes.message || "Failed to load users");
      if (!ordersRes.success)
        throw new Error(ordersRes.message || "Failed to load orders");
      if (!categoriesRes.success)
        throw new Error(categoriesRes.message || "Failed to load categories");
      if (!medicinesRes.success)
        throw new Error(medicinesRes.message || "Failed to load medicines");

      const users = usersRes.data ?? [];
      const orders = ordersRes.data ?? [];
      const categories = categoriesRes.data ?? [];
      const medicines = medicinesRes.data ?? [];

      // Users
      setUserCount(users.length);
      setSellerCount(users.filter((u) => u.role === "SELLER").length);
      setCustomerCount(users.filter((u) => u.role === "CUSTOMER").length);
      setBannedCount(users.filter((u) => u.isBanned).length);

      // Orders
      setOrderCount(orders.length);
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

      // Catalog
      setCategoryCount(categories.length);
      setMedicineCount(medicines.length);
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
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </div>

        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border p-6">Loading dashboard…</div>
      ) : (
        <>
          {/* Top stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{userCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sellers: {sellerCount} • Customers: {customerCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Banned Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{bannedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active: {Math.max(userCount - bannedCount, 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{orderCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Revenue (sum): {fmtBDT(revenue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Catalogue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{medicineCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Categories: {categoryCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Orders breakdown + quick links */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    Object.keys(orderTotals) as Array<keyof typeof orderTotals>
                  ).map((k) => (
                    <div key={k} className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground">{k}</p>
                      <p className="text-lg font-semibold">{orderTotals[k]}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border p-3">
                  <p className="text-sm font-medium">Review Users</p>
                  <p className="text-xs text-muted-foreground">
                    Ban/unban and role changes.
                  </p>
                  <Button asChild size="sm" className="mt-2 w-full">
                    <Link href="/admin/users">Open</Link>
                  </Button>
                </div>

                <div className="rounded-md border p-3">
                  <p className="text-sm font-medium">Monitor Orders</p>
                  <p className="text-xs text-muted-foreground">
                    Update order status quickly.
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="mt-2 w-full"
                    variant="outline"
                  >
                    <Link href="/admin/orders">Open</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-xs text-muted-foreground">
            Note: Admin medicines listing doesn’t exist in backend. This
            dashboard uses public{" "}
            <span className="font-medium">GET /api/v1/medicines</span> for
            medicine count.
          </p>
        </>
      )}
    </main>
  );
}
