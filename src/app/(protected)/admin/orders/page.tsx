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
  totalAmount: number | string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  _count?: { items?: number };
  items?: Array<{
    id: string;
    quantity: number;
    price: number | string;
    medicine?: { id: string; name: string } | null;
  }>;
};

type ApiListResponse<T> = {
  success: boolean;
  message?: string;
  meta?: { page?: number; limit?: number; total?: number };
  data?: T;
};

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

function clampId(id: string) {
  if (!id) return "";
  return id.length > 18 ? `${id.slice(0, 10)}…${id.slice(-6)}` : id;
}

function summarizeMedicines(items?: OrderListItem["items"]) {
  const safe = items ?? [];
  const names = safe
    .map((it) => it.medicine?.name?.trim())
    .filter(Boolean) as string[];

  if (names.length === 0) return "—";

  const uniq = Array.from(new Set(names));
  const shown = uniq.slice(0, 2);
  const remaining = uniq.length - shown.length;

  return remaining > 0 ? `${shown.join(", ")} +${remaining}` : shown.join(", ");
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
  status?: OrderStatus | "ALL";
  page?: number;
  limit?: number;
}): Promise<ApiListResponse<OrderListItem[]>> {
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  params.set("limit", String(opts.limit ?? 20));
  if (opts.status && opts.status !== "ALL") params.set("status", opts.status);

  const res = await fetch(`/api/v1/admin/orders?${params.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

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
      const res = await fetchAdminOrders({ status, page, limit });
      const list = res.data ?? [];

      const query = q.trim().toLowerCase();
      const filtered = !query
        ? list
        : list.filter((o) => {
            const hay = [
              o.id,
              o.customer?.name ?? "",
              o.customer?.email ?? "",
              o.status,
              ...(o.items ?? []).map((it) => it?.medicine?.name ?? ""),
            ]
              .join(" ")
              .toLowerCase();
            return hay.includes(query);
          });

      setOrders(filtered);
      setTotal(res.meta?.total ?? filtered.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [q, status, page, limit]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    setPage(1);
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

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by order id, customer, medicine…"
          className="w-full lg:max-w-md"
        />

        <Select
          value={status}
          onValueChange={(v) => setStatus(v as OrderStatus | "ALL")}
        >
          <SelectTrigger className="w-full lg:w-52">
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

      <div className="grid gap-3 md:hidden">
        {loading ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            No orders found.
          </div>
        ) : (
          orders.map((o) => {
            const itemsCount = o._count?.items ?? o.items?.length ?? 0;
            const medSummary = summarizeMedicines(o.items);

            return (
              <div key={o.id} className="rounded-2xl border p-4 space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Order</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {clampId(o.id)}
                  </div>
                  {medSummary !== "—" ? (
                    <div className="text-xs text-muted-foreground truncate">
                      {medSummary}
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Customer
                    </div>
                    <div className="text-sm font-medium truncate">
                      {o.customer?.name ?? "Customer"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {o.customer?.email ?? ""}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="text-sm font-medium">{o.status}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="text-sm font-semibold">
                      {formatBDT(o.totalAmount)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Items</div>
                    <div className="text-sm">{itemsCount}</div>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div className="text-sm">{formatDate(o.createdAt)}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/admin/orders/${o.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden md:block rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[320px]">Order</TableHead>
              <TableHead className="min-w-55">Customer</TableHead>
              <TableHead className="min-w-35">Status</TableHead>
              <TableHead className="text-right min-w-35">Total</TableHead>
              <TableHead className="text-right min-w-25">Items</TableHead>
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
                      <span className="truncate max-w-130">{o.id}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-130">
                        {summarizeMedicines(o.items)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="truncate max-w-65">
                        {o.customer?.name ?? "Customer"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-65">
                        {o.customer?.email ?? ""}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    {o.status}
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    {formatBDT(o.totalAmount)}
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    {o._count?.items ?? o.items?.length ?? "-"}
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    {formatDate(o.createdAt)}
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
