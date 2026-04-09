"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { clientApi } from "@/lib/client-api";
import type { OrderStatus } from "@/types/api";

type SellerOrderItemApi = {
  id: string;
  quantity: number;
  price: number | string;
  createdAt: string;
  medicine?: {
    id: string;
    name: string;
    imageUrl?: string | null;
  } | null;
  order: {
    id: string;
    status: OrderStatus;
    totalAmount: number | string;
    createdAt: string;
    updatedAt: string;
    customer?: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
  };
};

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  medicine?: {
    id: string;
    name: string;
    imageUrl?: string | null;
  } | null;
};

type SellerOrderDetails = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  items: OrderItem[];
};

function toNumber(v: unknown) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function formatBDT(amount: number) {
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

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function clampText(v: string, left = 14, right = 10) {
  if (!v) return "";
  if (v.length <= left + right + 1) return v;
  return `${v.slice(0, left)}…${v.slice(-right)}`;
}

const STATUS_OPTIONS: OrderStatus[] = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

async function fetchSellerOrderById(inputId: string): Promise<SellerOrderDetails> {
  const items = await clientApi<SellerOrderItemApi[]>(
    "/seller/orders?limit=200&page=1&sortBy=createdAt&sortOrder=desc"
  );

  const list = Array.isArray(items) ? items : [];

  let orderId = inputId;
  let orderItems = list.filter((it) => it.order?.id === orderId);

  if (orderItems.length === 0) {
    const foundItem = list.find((it) => it.id === inputId);
    if (foundItem?.order?.id) {
      orderId = foundItem.order.id;
      orderItems = list.filter((it) => it.order?.id === orderId);
    }
  }

  if (orderItems.length === 0) {
    throw new Error("Order not found for this seller.");
  }

  const o = orderItems[0].order;

  const mappedItems: OrderItem[] = orderItems.map((it) => ({
    id: it.id,
    quantity: Math.trunc(toNumber(it.quantity)),
    price: toNumber(it.price),
    medicine: it.medicine
      ? {
          id: it.medicine.id,
          name: it.medicine.name,
          imageUrl: it.medicine.imageUrl ?? null,
        }
      : null,
  }));

  const subtotal = mappedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

  return {
    id: orderId,
    status: o.status,
    totalAmount: subtotal,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    customer: o.customer ?? null,
    items: mappedItems,
  };
}

async function updateOrderStatus(id: string, status: OrderStatus) {
  return clientApi<any>(`/seller/orders/${id}`, {
    method: "PATCH",
    body: { status },
  });
}

export default function SellerOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [order, setOrder] = React.useState<SellerOrderDetails | null>(null);
  const [status, setStatus] = React.useState<OrderStatus>("PLACED");

  const load = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchSellerOrderById(id);
      setOrder(data);
      setStatus(data.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const subtotal = React.useMemo(() => {
    if (!order) return 0;
    return order.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [order]);

  const onSaveStatus = async () => {
    if (!order) return;
    if (status === order.status) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await updateOrderStatus(order.id, status);

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: updated.status,
              updatedAt: updated.updatedAt,
              totalAmount: prev.items.reduce((sum, it) => sum + it.price * it.quantity, 0),
              customer: updated.customer ?? prev.customer,
            }
          : prev
      );
      setStatus(updated.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/seller/orders">Back</Link>
            </Button>
            <h1 className="text-xl font-semibold">Order Details</h1>
          </div>

          <p className="text-sm text-muted-foreground break-all">
            {order?.id ? `Order ID: ${order.id}` : id ? `Order ID: ${id}` : ""}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading || saving}
          className="w-full sm:w-auto"
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border p-6">Loading…</div>
      ) : !order ? (
        <div className="rounded-lg border p-6">Order not found.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-lg border">
            <div className="p-4">
              <h2 className="font-semibold">Items</h2>
              <p className="text-sm text-muted-foreground">{order.items.length} item(s)</p>
            </div>
            <Separator />

            <div className="p-4 space-y-3 md:hidden">
              {order.items.map((it) => (
                <div key={it.id} className="rounded-2xl border p-4 space-y-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Medicine</div>
                    <div className="font-semibold truncate">{it.medicine?.name ?? "Medicine"}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground font-mono break-all">
                      {it.medicine?.id ?? ""}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Price</div>
                      <div className="font-medium">{formatBDT(it.price)}</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-xs text-muted-foreground">Qty</div>
                      <div className="font-medium">{it.quantity}</div>
                    </div>

                    <div className="col-span-2 space-y-0.5">
                      <div className="text-xs text-muted-foreground">Line total</div>
                      <div className="font-medium">{formatBDT(it.price * it.quantity)}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border p-4 flex items-center justify-between">
                <span className="font-semibold">Subtotal</span>
                <span className="font-semibold">{formatBDT(subtotal)}</span>
              </div>
            </div>

            <div className="hidden md:block p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-65">Medicine</TableHead>
                      <TableHead className="text-right min-w-35">Price</TableHead>
                      <TableHead className="text-right min-w-22.5">Qty</TableHead>
                      <TableHead className="text-right min-w-40">Line total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{it.medicine?.name ?? "Medicine"}</span>
                            <div className="text-xs text-muted-foreground font-mono truncate max-w-105">
                              {it.medicine?.id ?? ""}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatBDT(it.price)}
                        </TableCell>
                        <TableCell className="text-right">{it.quantity}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatBDT(it.price * it.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-semibold">
                        Subtotal
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        {formatBDT(subtotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>

          <aside className="rounded-lg border h-fit">
            <div className="p-4 space-y-3">
              <h2 className="font-semibold">Summary</h2>

              <div className="text-sm space-y-2">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="text-right truncate max-w-[60%]">
                    {order.customer?.name ?? "Customer"}
                  </span>
                </div>

                {order.customer?.email ? (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-right truncate max-w-[60%]">{order.customer.email}</span>
                  </div>
                ) : null}

                {order.customer?.phone ? (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="text-right truncate max-w-[60%]">{order.customer.phone}</span>
                  </div>
                ) : null}

                <Separator />

                <div className="flex justify-between gap-3 text-base font-semibold">
                  <span>Total</span>
                  <span className="text-right whitespace-nowrap">
                    {formatBDT(order.totalAmount)}
                  </span>
                </div>

                <div className="pt-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>Created</span>
                    <span className="text-right">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Updated</span>
                    <span className="text-right">{formatDate(order.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Order Status</p>

                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as OrderStatus)}
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
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
                  className="w-full"
                  onClick={() => void onSaveStatus()}
                  disabled={saving || status === order.status}
                >
                  {saving ? "Saving…" : "Update Status"}
                </Button>

                <p className="text-xs text-muted-foreground">
                  Current status: <span className="font-medium">{order.status}</span>
                </p>

                <div className="pt-1 text-[11px] text-muted-foreground font-mono break-all">
                  {order.id ? `#${clampText(order.id, 18, 12)}` : ""}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
