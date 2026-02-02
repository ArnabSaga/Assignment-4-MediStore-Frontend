"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Truck } from "lucide-react";

import { env } from "@/env";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
};

type Medicine = {
  id: string;
  name: string;
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
  status: OrderStatus;
  totalAmount: string | number;
  shippingAddress: string;
  items: OrderItem[];
};

const API_BASE = "/api/v1";

function orderRef(id: string) {
  const short = id.replace(/-/g, "").slice(-6).toUpperCase();
  return `MS-${short}`;
}

function asNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
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
      return "destructive";
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

async function apiGetOrder(id: string, signal?: AbortSignal): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    signal,
  });

  const json = (await res
    .json()
    .catch(() => null)) as ApiResponse<Order> | null;

  if (res.status === 401 || res.status === 403) {
    throw new Error("Please login with a verified customer account.");
  }

  if (!res.ok || !json?.success || !json.data) {
    throw new Error(readApiError(json, "Failed to load order."));
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
    throw new Error(readApiError(json, "Failed to cancel order."));
  }

  return json.data;
}

export default function AccountOrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [order, setOrder] = React.useState<Order | null>(null);
  const [canceling, setCanceling] = React.useState(false);

  const subtotal = React.useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items.reduce((sum, it) => {
      const price = asNumber(it.price);
      const qty = asNumber(it.quantity);
      return sum + price * qty;
    }, 0);
  }, [order]);

  React.useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiGetOrder(id, controller.signal);
        setOrder(data);
      } catch (e: any) {
        if (e?.name !== "AbortError")
          setError(e?.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id]);

  const onCancel = async () => {
    if (!order) return;

    if (order.status !== "PLACED") {
      setError("Only PLACED orders can be cancelled.");
      return;
    }

    const ok = window.confirm(
      "Cancel this order? This action cannot be undone."
    );
    if (!ok) return;

    setCanceling(true);
    setError(null);

    try {
      const updated = await apiCancelOrder(order.id);
      setOrder(updated);
    } catch (e: any) {
      setError(e?.message || "Failed to cancel order.");
    } finally {
      setCanceling(false);
    }
  };

  return (
    <main className="pb-14">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">
              <Link href="/account/orders" className="hover:underline">
                My Orders
              </Link>{" "}
              / Order details
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {order ? `Order #${orderRef(order.id)}` : "Order details"}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Track status and view purchased items.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Separator />

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading order…
          </div>
        ) : !order ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Order not found.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items?.length ? (
                  order.items.map((it) => {
                    const name = it.medicine?.name ?? "Unknown medicine";
                    const lineTotal =
                      asNumber(it.price) * asNumber(it.quantity);

                    return (
                      <div
                        key={it.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Qty: {it.quantity}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-medium">
                            {formatBDT(lineTotal)}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatBDT(it.price)} each
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-sm text-muted-foreground">
                    No items found.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={statusBadgeVariant(order.status) as any}>
                    {order.status}
                  </Badge>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Shipping address</p>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                    {order.shippingAddress}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatBDT(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">
                      {formatBDT(order.totalAmount)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  onClick={onCancel}
                  disabled={order.status !== "PLACED" || canceling}
                  className="w-full rounded-xl"
                >
                  {canceling ? "Canceling…" : "Cancel order"}
                </Button>

                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link href="/shop">Continue shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
