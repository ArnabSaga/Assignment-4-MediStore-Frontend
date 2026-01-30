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

type OrderListItem = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  _count?: { items?: number };
};

type ApiListResponse<T> = {
  success: boolean;
  message?: string;
  meta?: { page?: number; limit?: number; total?: number };
  data?: T;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

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

const STATUS_OPTIONS: Array<{ label: string; value: OrderStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Placed", value: "PLACED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

async function fetchAdminOrders(opts: {
  q?: string;
  status?: OrderStatus | "ALL";
  page?: number;
  limit?: number;
}): Promise<ApiListResponse<OrderListItem[]>> {
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  params.set("limit", String(opts.limit ?? 20));
  if (opts.q?.trim()) params.set("q", opts.q.trim());
  if (opts.status && opts.status !== "ALL") params.set("status", opts.status);

  const res = await fetch(
    `${BACKEND_URL}/api/v1/admin/orders?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );

  const json = (await res.json().catch(() => null)) as ApiListResponse<
    OrderListItem[]
  > | null;

  if (!res.ok) {
    throw new Error(json?.message || `Failed to load orders (${res.status})`);
  }

  if (!json?.success) {
    throw new Error(json?.message || "Failed to load orders");
  }

  return json;
}

export default function AdminOrdersPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<OrderStatus | "ALL">("ALL");

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);

  const [orders, setOrders] = React.useState<OrderListItem[]>([]);
  const [total, setTotal] = React.useState<number>(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchAdminOrders({ q, status, page, limit });
      setOrders(res.data ?? []);
      setTotal(res.meta?.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [q, status, page, limit]);

  React.useEffect(() => {
    void load();
  }, [load]);

  // reset to first page when filters change
  React.useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  const maxPage = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Orders</h1>
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

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by order id, customer name/email…"
          className="md:max-w-md"
        />

        <Select
          value={status}
          onValueChange={(v) => setStatus(v as OrderStatus | "ALL")}
        >
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Filter by status" />
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

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-65">Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  Loading orders…
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="truncate">{o.id}</span>
                      <span className="text-xs text-muted-foreground">
                        {o.status}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="truncate">
                        {o.customer?.name ?? "Customer"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {o.customer?.email ?? ""}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{o.status}</TableCell>

                  <TableCell className="text-right">
                    {formatBDT(o.totalAmount)}
                  </TableCell>

                  <TableCell className="text-right">
                    {o._count?.items ?? "-"}
                  </TableCell>

                  <TableCell className="text-right">
                    {formatDate(o.createdAt)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button asChild size="sm">
                      <Link href={`/admin/orders/${o.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {maxPage} • Total {total}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={loading || page <= 1}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={loading || page >= maxPage}
          >
            Next
          </Button>
        </div>
      </div>
    </main>
  );
}
