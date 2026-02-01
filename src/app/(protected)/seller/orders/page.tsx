"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrderStatus =
  | "PLACED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type SellerOrderItemApi = {
  id: string;
  quantity: number;
  price: number | string;
  createdAt: string;
  medicine?: {
    id: string;
    name: string;
    image?: string | null;
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

type ApiListResponse<T> = {
  success: boolean;
  message?: string;
  meta?: { page?: number; limit?: number; total?: number };
  data?: T;
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

function clampText(v: string, left = 14, right = 8) {
  if (!v) return "";
  if (v.length <= left + right + 1) return v;
  return `${v.slice(0, left)}…${v.slice(-right)}`;
}

const STATUS_OPTIONS: Array<{ label: string; value: OrderStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Placed", value: "PLACED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

async function fetchSellerOrderItems(): Promise<SellerOrderItemApi[]> {
  const res = await fetch(`/api/v1/seller/orders?limit=200&page=1`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as ApiListResponse<
    SellerOrderItemApi[]
  > | null;

  if (!res.ok) {
    const msg = json?.message || `Failed to load orders (${res.status})`;
    throw new Error(msg);
  }

  if (!json?.success) {
    throw new Error(json?.message || "Failed to load orders");
  }

  return Array.isArray(json.data) ? json.data : [];
}

type SellerOrderRow = {
  orderId: string;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  itemsCount: number;
  total: number;
};

export default function SellerOrdersPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<SellerOrderRow[]>([]);

  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<OrderStatus | "ALL">("ALL");

  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await fetchSellerOrderItems();

      const map = new Map<string, SellerOrderRow>();

      for (const it of items) {
        const orderId = it.order?.id;
        if (!orderId) continue;

        const price = toNumber(it.price);
        const qty = toNumber(it.quantity);
        const line = price * qty;

        const existing = map.get(orderId);

        if (!existing) {
          map.set(orderId, {
            orderId,
            status: it.order.status,
            createdAt: it.order.createdAt,
            customerName: it.order.customer?.name || "Customer",
            customerEmail: it.order.customer?.email || "",
            itemsCount: 1,
            total: line,
          });
        } else {
          existing.itemsCount += 1;
          existing.total += line;
          existing.status = it.order.status;
          existing.createdAt = it.order.createdAt;
        }
      }

      const list = Array.from(map.values()).sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1
      );

      setRows(list);

      const maxPage = Math.max(1, Math.ceil(list.length / pageSize));
      setPage((p) => Math.min(p, maxPage));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    return rows
      .filter((o) => (status === "ALL" ? true : o.status === status))
      .filter((o) => {
        if (!query) return true;
        const hay = [o.orderId, o.customerName, o.customerEmail, o.status]
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      });
  }, [rows, q, status]);

  React.useEffect(() => {
    setPage(1);
  }, [q, status]);

  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your customer orders.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          placeholder="Search by Order ID, customer name/email, status…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full lg:max-w-md"
        />

        <Select
          value={status}
          onValueChange={(v) => setStatus(v as OrderStatus | "ALL")}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-3 md:hidden">
        {loading ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Loading orders…
          </div>
        ) : pageItems.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            No orders found.
          </div>
        ) : (
          pageItems.map((o) => (
            <div key={o.orderId} className="rounded-2xl border p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Order ID</div>
                  <div className="font-semibold font-mono break-all">
                    {clampText(o.orderId, 16, 10)}
                  </div>
                </div>

                <Button asChild size="sm" className="shrink-0 rounded-md">
                  <Link href={`/seller/orders/${o.orderId}`}>View</Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-0.5">
                  <div className="text-xs text-muted-foreground">Customer</div>
                  <div className="truncate">{o.customerName}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {o.customerEmail || "—"}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-medium">{o.status}</div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="font-medium">{formatBDT(o.total)}</div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs text-muted-foreground">Items</div>
                  <div className="font-medium">{o.itemsCount}</div>
                </div>

                <div className="col-span-2 space-y-0.5">
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-65">Order</TableHead>
              <TableHead className="min-w-55">Customer</TableHead>
              <TableHead className="min-w-35">Status</TableHead>
              <TableHead className="text-right min-w-35">Total</TableHead>
              <TableHead className="text-right min-w-27.5">Items</TableHead>
              <TableHead className="text-right min-w-55">Created</TableHead>
              <TableHead className="text-right min-w-30">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  Loading orders…
                </TableCell>
              </TableRow>
            ) : pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((o) => (
                <TableRow key={o.orderId}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono truncate max-w-90">
                        {o.orderId}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {o.status}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate max-w-65">
                        {o.customerName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-65">
                        {o.customerEmail}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{o.status}</TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    {formatBDT(o.total)}
                  </TableCell>

                  <TableCell className="text-right">{o.itemsCount}</TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    {formatDate(o.createdAt)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button asChild size="sm" className="rounded-md">
                      <Link href={`/seller/orders/${o.orderId}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && total > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {maxPage} • Total {total}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-full sm:w-auto"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              disabled={page >= maxPage}
              className="w-full sm:w-auto"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
