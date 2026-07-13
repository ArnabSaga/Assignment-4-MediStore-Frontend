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
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard";

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

function statusClassName(status: OrderStatus) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "CANCELLED":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "SHIPPED":
      return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "PROCESSING":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "PLACED":
    default:
      return "border-border bg-muted/40 text-foreground";
  }
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
    <div className="space-y-6">
      <DashboardPageHeader
        title="Orders"
        description="Review marketplace orders and open individual fulfilment workflows."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]}
        actions={
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh
        </Button>
        }
      />

      {error ? (
        <div className="dashboard-panel border-destructive/30 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      <div className="dashboard-toolbar flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

      <div className="grid gap-3 xl:hidden">
        {loading ? (
          <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
            No orders found.
          </div>
        ) : (
          orders.map((o) => {
            const itemsCount = o._count?.items ?? o.items?.length ?? 0;
            const medSummary = summarizeMedicines(o.items);

            return (
              <div key={o.id} className="dashboard-mobile-card space-y-3">
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

      <DashboardPanel className="hidden p-0 xl:block">
        <div className="divide-y">
          <div className="grid grid-cols-[minmax(260px,1.4fr)_minmax(190px,1fr)_minmax(110px,0.7fr)_minmax(110px,0.6fr)_minmax(170px,0.9fr)_auto] gap-4 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <div>Order</div>
            <div>Customer</div>
            <div>Status</div>
            <div>Total</div>
            <div>Created</div>
            <div className="text-right">Action</div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No orders found.
            </div>
          ) : (
            orders.map((o) => {
              const itemsCount = o._count?.items ?? o.items?.length ?? 0;

              return (
                <div
                  key={o.id}
                  className="grid grid-cols-[minmax(260px,1.4fr)_minmax(190px,1fr)_minmax(110px,0.7fr)_minmax(110px,0.6fr)_minmax(170px,0.9fr)_auto] items-center gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{o.id}</div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {summarizeMedicines(o.items)} • {itemsCount} item
                      {itemsCount === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {o.customer?.name ?? "Customer"}
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {o.customer?.email ?? ""}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClassName(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </div>

                  <div className="whitespace-nowrap text-sm font-semibold">
                    {formatBDT(o.totalAmount)}
                  </div>

                  <div className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </div>

                  <div className="flex justify-end">
                    <Button asChild size="sm">
                      <Link href={`/admin/orders/${o.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DashboardPanel>

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
    </div>
  );
}
