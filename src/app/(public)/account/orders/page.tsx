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

const API_BASE = "/api/v1";

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

          <Select
            value={status}
            onValueChange={(v) => setStatus(v as any)}
            disabled={loading}
          >
            <SelectTrigger className="w-full md:w-44 rounded-xl">
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
            <>
              <div className="md:hidden space-y-3">
                {filtered.map((o) => {
                  const itemsLabel = summarizeItems(o.items);
                  const itemsCount =
                    o.items?.reduce(
                      (sum, it) => sum + asNumber(it.quantity),
                      0
                    ) ??
                    o.items?.length ??
                    0;

                  const canCancel = o.status === "PLACED";
                  const cancelBusy = cancelingId === o.id;

                  return (
                    <div
                      key={o.id}
                      className="rounded-2xl border p-4 space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="font-medium leading-5">
                          {itemsLabel}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {o.shippingAddress}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
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

                        <div className="text-sm font-medium">
                          {formatBDT(o.totalAmount)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Items
                          </div>
                          <div className="font-medium">{itemsCount}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Created
                          </div>
                          <div className="font-medium">
                            {formatDate(o.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-xl h-9 flex-1"
                        >
                          <Link href={`/account/orders/${o.id}`}>View</Link>
                        </Button>

                        {canCancel ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-xl h-9 flex-1 text-black dark:text-white"
                            disabled={cancelBusy}
                            onClick={() => void onCancel(o.id)}
                          >
                            {cancelBusy ? "Canceling…" : "Cancel"}
                          </Button>
                        ) : (
                          <button
                            type="button"
                            aria-disabled="true"
                            className="flex-1 inline-flex items-center justify-center rounded-xl border h-9 text-sm text-muted-foreground opacity-70 cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm table-fixed">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 pr-4 text-left font-medium w-[42%]">
                        Order
                      </th>
                      <th className="py-3 pr-4 text-left font-medium w-27.5">
                        Status
                      </th>
                      <th className="py-3 pr-4 text-left font-medium w-30">
                        Total
                      </th>
                      <th className="py-3 pr-4 text-left font-medium w-17.5">
                        Items
                      </th>
                      <th className="py-3 pr-6 text-left font-medium w-42.5 whitespace-nowrap">
                        Created
                      </th>
                      <th className="py-3 text-right font-medium w-55 whitespace-nowrap">
                        Actions
                      </th>
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

                      const canCancel = o.status === "PLACED";
                      const cancelBusy = cancelingId === o.id;

                      return (
                        <tr
                          key={o.id}
                          className="border-b last:border-b-0 align-top"
                        >
                          <td className="py-4 pr-4 overflow-hidden">
                            <div className="font-medium leading-5 truncate">
                              {itemsLabel}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground truncate">
                              {o.shippingAddress}
                            </div>
                          </td>

                          <td className="py-4 pr-4 whitespace-nowrap">
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

                          <td className="py-4 pr-4 font-medium whitespace-nowrap">
                            {formatBDT(o.totalAmount)}
                          </td>

                          <td className="py-4 pr-4 whitespace-nowrap">
                            {itemsCount}
                          </td>

                          <td className="py-4 pr-6 whitespace-nowrap">
                            {formatDate(o.createdAt)}
                          </td>

                          <td className="py-4 whitespace-nowrap">
                            <div className="flex justify-end gap-2">
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="rounded-xl h-9 px-4"
                              >
                                <Link href={`/account/orders/${o.id}`}>
                                  View
                                </Link>
                              </Button>

                              {canCancel ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="rounded-xl h-9 px-4 text-black dark:text-white"
                                  disabled={cancelBusy}
                                  onClick={() => void onCancel(o.id)}
                                >
                                  {cancelBusy ? "Canceling…" : "Cancel"}
                                </Button>
                              ) : (
                                <button
                                  type="button"
                                  aria-disabled="true"
                                  className="inline-flex items-center justify-center rounded-xl border px-4 h-9 text-sm text-muted-foreground opacity-70 cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
