"use client";

import * as React from "react";
import Link from "next/link";

import { env } from "@/env";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrderStatus =
  | "PLACED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: { page?: number; limit?: number };
};

type Medicine = {
  id: string;
  name: string;
  price?: string | number | null;
  image?: string | null;
};

type OrderItem = {
  id: string;
  quantity: number;
  price: string | number;
  medicine?: Medicine | null;
};

type Order = {
  id: string;
  customerId: string;
  totalAmount: string | number;
  status: OrderStatus;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

const STATUSES: Array<"ALL" | OrderStatus> = [
  "ALL",
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const API_BASE = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");

function asNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  if (v && typeof v === "object" && "toString" in v) {
    const n = Number.parseFloat(String(v));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function formatBDT(amount: unknown) {
  const n = asNumber(amount);
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `BDT ${n.toFixed(2)}`;
  }
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function statusBadgeVariant(status: OrderStatus) {
  switch (status) {
    case "PLACED":
      return "secondary";
    case "PROCESSING":
      return "default";
    case "SHIPPED":
      return "outline";
    case "DELIVERED":
      return "default";
    case "CANCELLED":
      return "secondary";
    default:
      return "secondary";
  }
}

function readApiError(json: any, fallback: string) {
  if (!json) return fallback;
  if (typeof json.message === "string" && json.message.trim())
    return json.message;
  if (typeof json.error === "string" && json.error.trim()) return json.error;
  return fallback;
}

function summarizeItems(items?: OrderItem[]) {
  const safe = items ?? [];
  if (!safe.length) return "No items";

  const names = safe
    .map((it) => it.medicine?.name?.trim())
    .filter(Boolean) as string[];

  const unique = Array.from(new Set(names));
  const shown = unique.slice(0, 2);
  const remaining = unique.length - shown.length;

  const label = shown.join(", ");
  return remaining > 0 ? `${label} +${remaining} more` : label;
}

async function apiListOrders(signal?: AbortSignal): Promise<Order[]> {
  const url = new URL(`${API_BASE}/orders`);
  url.searchParams.set("page", "1");
  url.searchParams.set("limit", "50");
  url.searchParams.set("sortBy", "createdAt");
  url.searchParams.set("sortOrder", "desc");

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    signal,
  });

  const json = (await res.json().catch(() => null)) as ApiResponse<
    Order[]
  > | null;

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      "Please login with a verified customer account to view orders."
    );
  }

  if (!res.ok || !json?.success || !json.data) {
    throw new Error(readApiError(json, "Failed to fetch orders"));
  }

  return json.data;
}

async function apiCancelOrder(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const json = (await res
    .json()
    .catch(() => null)) as ApiResponse<Order> | null;

  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized. Please login again.");
  }

  if (!res.ok || !json?.success || !json.data) {
    throw new Error(readApiError(json, "Failed to cancel order"));
  }

  return json.data;
}

export default function AccountOrdersPage() {
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"ALL" | OrderStatus>("ALL");

  const [cancelingId, setCancelingId] = React.useState<string | null>(null);

  const load = React.useCallback(async (soft = false) => {
    const controller = new AbortController();

    if (soft) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const data = await apiListOrders(controller.signal);
      setOrders(data);
    } catch (e: any) {
      if (e?.name !== "AbortError")
        setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    void load(false);
  }, [load]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    return orders
      .filter((o) => (status === "ALL" ? true : o.status === status))
      .filter((o) => {
        if (!query) return true;

        const medicines = (o.items ?? [])
          .map((it) => it.medicine?.name ?? "")
          .join(" ")
          .toLowerCase();

        return medicines.includes(query);
      });
  }, [orders, q, status]);

  const onCancel = async (id: string) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    if (target.status !== "PLACED") {
      setError("Only PLACED orders can be cancelled.");
      return;
    }

    const ok = window.confirm(
      "Cancel this order? This action cannot be undone."
    );
    if (!ok) return;

    setCancelingId(id);
    setError(null);

    try {
      const updated = await apiCancelOrder(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (e: any) {
      setError(e?.message || "Failed to cancel order");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">My Orders</h1>
          <p className="text-sm text-muted-foreground">
            View your order history and track status.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void load(true)}
          disabled={loading || refreshing}
          className="rounded-xl"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <Separator />

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search by medicine name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="md:max-w-md rounded-xl"
            disabled={loading}
          />

          <div className="flex gap-2">
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as any)}
              disabled={loading}
            >
              <SelectTrigger className="w-44 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "ALL" ? "All statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      )}

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            Orders{" "}
            <span className="text-muted-foreground font-normal">
              ({filtered.length})
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading orders…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Order</th>
                    <th className="py-3 text-left font-medium">Status</th>
                    <th className="py-3 text-left font-medium">Total</th>
                    <th className="py-3 text-left font-medium">Items</th>
                    <th className="py-3 text-left font-medium">Created</th>
                    <th className="py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((o) => {
                    const itemsLabel = summarizeItems(o.items);
                    const itemsCount =
                      o.items?.reduce(
                        (sum, it) => sum + asNumber(it.quantity),
                        0
                      ) ??
                      o.items?.length ??
                      0;

                    return (
                      <tr
                        key={o.id}
                        className="border-b last:border-b-0 align-middle"
                      >
                        <td className="py-4">
                          <div className="font-medium leading-5">
                            {itemsLabel}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            {o.shippingAddress}
                          </div>
                        </td>

                        <td className="py-4">
                          <Badge
                            variant={statusBadgeVariant(o.status) as any}
                            className={
                              o.status === "CANCELLED"
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive"
                                : ""
                            }
                          >
                            {o.status}
                          </Badge>
                        </td>

                        {/* Total */}
                        <td className="py-4 font-medium">
                          {formatBDT(o.totalAmount)}
                        </td>

                        {/* Items */}
                        <td className="py-4">{itemsCount}</td>

                        {/* Created */}
                        <td className="py-4 whitespace-nowrap">
                          {formatDate(o.createdAt)}
                        </td>

                        {/* Actions: Cancel always visible */}
                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="rounded-xl"
                            >
                              <Link href={`/account/orders/${o.id}`}>View</Link>
                            </Button>

                            {o.status === "PLACED" ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-xl"
                                disabled={cancelingId === o.id}
                                onClick={() => void onCancel(o.id)}
                              >
                                {cancelingId === o.id ? "Canceling…" : "Cancel"}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl opacity-100 cursor-not-allowed text-muted-foreground"
                                disabled
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
