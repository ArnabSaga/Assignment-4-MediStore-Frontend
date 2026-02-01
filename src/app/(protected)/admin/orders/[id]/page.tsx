"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

type OrderItem = {
  id: string;
  quantity: number;
  price: number | string;
  medicine?: { id: string; name: string } | null;
};

type OrderDetails = {
  id: string;
  status: OrderStatus;
  totalAmount: number | string;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name?: string | null; email?: string | null } | null;
  items?: OrderItem[];
};

type ApiResponse<T> = { success: boolean; message?: string; data?: T };
type ApiListResponse<T> = {
  success: boolean;
  message?: string;
  meta?: { page?: number; limit?: number; total?: number };
  data?: T;
};

const STATUS_OPTIONS: OrderStatus[] = [
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function toNumber(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function formatBDT(amount: unknown) {
  const n = toNumber(amount);
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `৳${Math.round(n)}`;
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

async function readAdminOrders(): Promise<OrderDetails[]> {
  const res = await fetch(`/api/v1/admin/orders?limit=800&page=1`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as ApiListResponse<
    OrderDetails[]
  > | null;

  if (!res.ok) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  if (!json?.success) {
    throw new Error(json?.message || "Failed to load orders");
  }

  return Array.isArray(json.data) ? json.data : [];
}

async function patchAdminOrderStatus(id: string, status: OrderStatus) {
  const res = await fetch(`/api/v1/admin/orders/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    cache: "no-store",
  });

  const json = (await res
    .json()
    .catch(() => null)) as ApiResponse<OrderDetails> | null;

  if (!res.ok) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  if (!json?.success || !json.data) {
    throw new Error(json?.message || "Failed to update order");
  }

  return json.data;
}

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [order, setOrder] = React.useState<OrderDetails | null>(null);
  const [status, setStatus] = React.useState<OrderStatus>("PLACED");

  const load = React.useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const list = await readAdminOrders();
      const found = list.find((o) => o.id === id);

      if (!found) throw new Error("Order not found.");

      setOrder(found);
      setStatus(found.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load order");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async () => {
    if (!order) return;

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await patchAdminOrderStatus(order.id, status);
      setOrder(updated);
      setStatus(updated.status);
      setSuccess("Order status updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Order Details</h1>
          <p className="text-sm text-muted-foreground">{id}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={busy}
          >
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={loading || busy}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border p-4">
          <p className="text-sm">{success}</p>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border p-6">Loading order…</div>
      ) : !order ? (
        <div className="rounded-lg border p-6">Order not found.</div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="text-sm font-medium">
                    {order.customer?.name ?? "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.customer?.email ?? ""}
                  </p>
                </div>

                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold">
                    {formatBDT(order.totalAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="flex gap-2">
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as OrderStatus)}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() => void updateStatus()}
                      disabled={busy || status === order.status}
                    >
                      {busy ? "Saving…" : "Save"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current: <span className="font-medium">{order.status}</span>
                  </p>
                </div>

                <div className="text-xs text-muted-foreground">
                  Updated: {formatDate(order.updatedAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {(order.items ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center">
                      No items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  (order.items ?? []).map((it) => {
                    const subtotal = toNumber(it.price) * toNumber(it.quantity);
                    return (
                      <TableRow key={it.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="truncate">
                              {it.medicine?.name ?? "Medicine"}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {it.medicine?.id ?? ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {it.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatBDT(it.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatBDT(subtotal)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </main>
  );
}
