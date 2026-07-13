"use client";

import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard";

import { clientApi } from "@/lib/client-api";
import type { OrderStatus, PaymentStatus } from "@/types/api";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

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
    paymentStatus: PaymentStatus;
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

function paymentStatusBadgeVariant(status: PaymentStatus): BadgeVariant {
  switch (status) {
    case "PAID":
      return "default";
    case "PENDING":
      return "secondary";
    case "FAILED":
      return "destructive";
    case "REFUNDED":
      return "outline";
    default:
      return "secondary";
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

async function fetchSellerOrderItems(): Promise<SellerOrderItemApi[]> {
  return clientApi<SellerOrderItemApi[]>("/seller/orders?limit=100&page=1");
}

type SellerOrderRow = {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
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
            paymentStatus: it.order.paymentStatus,
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
          existing.paymentStatus = it.order.paymentStatus;
          existing.createdAt = it.order.createdAt;
        }
      }

      const list = Array.from(map.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

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
        const hay = [o.orderId, o.customerName, o.customerEmail, o.status, o.paymentStatus].join(" ").toLowerCase();
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
    <div className="space-y-6">
      <DashboardPageHeader
        title="Orders"
        description="View and manage your seller-owned customer orders."
        breadcrumbs={[{ label: "Seller", href: "/seller/dashboard" }, { label: "Orders" }]}
        actions={
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Refresh
        </Button>
        }
      />

      <div className="dashboard-toolbar flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          placeholder="Search by Order ID, customer, status, payment…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full lg:max-w-md"
        />

        <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus | "ALL")}>
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
        <div className="dashboard-panel border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-3 md:hidden">
        {loading ? (
          <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
            Loading orders…
          </div>
        ) : pageItems.length === 0 ? (
          <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
            No orders found.
          </div>
        ) : (
          pageItems.map((o) => (
            <div key={o.orderId} className="dashboard-mobile-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Order ID</div>
                  <div className="font-semibold font-mono break-all">
                    {clampText(o.orderId, 16, 10)}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                   <Badge
                    variant={paymentStatusBadgeVariant(o.paymentStatus)}
                    className="text-[10px] h-5 justify-center"
                  >
                    {o.paymentStatus}
                  </Badge>
                  <Button asChild size="sm" className="rounded-md">
                    <Link href={`/seller/orders/${o.orderId}`}>View</Link>
                  </Button>
                </div>
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
                  <div className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <DashboardPanel className="hidden overflow-hidden p-0 md:block">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-50">Order</TableHead>
              <TableHead className="min-w-45">Customer</TableHead>
              <TableHead className="min-w-30">Status</TableHead>
              <TableHead className="min-w-30">Payment</TableHead>
              <TableHead className="text-right min-w-30">Total</TableHead>
              <TableHead className="text-right min-w-20">Items</TableHead>
              <TableHead className="text-right min-w-48">Created</TableHead>
              <TableHead className="text-right min-w-24">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  Loading orders…
                </TableCell>
              </TableRow>
            ) : pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((o) => (
                <TableRow key={o.orderId}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono truncate max-w-65">{o.orderId}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate max-w-45">{o.customerName}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-45">
                        {o.customerEmail}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {o.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={paymentStatusBadgeVariant(o.paymentStatus)}>
                      {o.paymentStatus}
                    </Badge>
                  </TableCell>

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
      </DashboardPanel>

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
    </div>
  );
}
