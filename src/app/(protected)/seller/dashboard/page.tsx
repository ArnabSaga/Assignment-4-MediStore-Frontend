import { cookies, headers } from "next/headers";
import { AlertTriangle, Boxes, PackageX, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  DashboardStatCard,
} from "@/components/dashboard";

type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type SellerMedicine = {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  isActive?: boolean;
  manufacturer?: string | null;
  imageUrl?: string | null;
};

type SellerOrderItem = {
  id: string;
  quantity: number;
  price: number | string;
  createdAt: string;
  medicine: {
    id: string;
    name: string;
  };
  order: {
    id: string;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
    shippingAddress: string;
    customer: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
    };
  };
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number };
};

function toNumber(v: number | string) {
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function money(n: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function statusBadge(status: OrderStatus) {
  switch (status) {
    case "PLACED":
      return <Badge variant="secondary">Placed</Badge>;
    case "PROCESSING":
      return <Badge>Processing</Badge>;
    case "SHIPPED":
      return <Badge variant="outline">Shipped</Badge>;
    case "DELIVERED":
      return <Badge className="bg-emerald-600 text-white">Delivered</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

async function backendFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  // Build origin dynamically (works on localhost and Vercel).
  const h = await headers();
  const host = h.get("host"); // localhost:3000 or your-domain.vercel.app
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  // Call the same-origin Next proxy instead of the backend origin.
  const res = await fetch(`${origin}${path}`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`Backend fetch failed: ${res.status} ${text}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Backend returned invalid JSON");
  }
}

export default async function SellerDashboardPage() {
  const [medRes, orderRes] = await Promise.all([
    backendFetch<ApiResponse<SellerMedicine[]>>("/api/v1/seller/medicines?limit=100&page=1"),
    backendFetch<ApiResponse<SellerOrderItem[]>>(
      "/api/v1/seller/orders?page=1&limit=100&sortBy=createdAt&sortOrder=desc"
    ),
  ]);

  const medicines = medRes.data ?? [];
  const orderItems = orderRes.data ?? [];

  const totalMedicines = medicines.length;
  const activeMedicines = medicines.filter((m) => m.isActive !== false).length;
  const outOfStock = medicines.filter((m) => (m.stock ?? 0) === 0).length;

  const orderMap = new Map<
    string,
    {
      orderId: string;
      status: OrderStatus;
      createdAt: string;
      updatedAt: string;
      customerName: string;
      customerEmail: string;
      sellerTotal: number;
    }
  >();

  for (const item of orderItems) {
    const oid = item.order.id;
    const prev = orderMap.get(oid);

    const lineTotal = toNumber(item.price) * (item.quantity ?? 0);

    if (!prev) {
      orderMap.set(oid, {
        orderId: oid,
        status: item.order.status,
        createdAt: item.order.createdAt,
        updatedAt: item.order.updatedAt,
        customerName: item.order.customer?.name ?? "—",
        customerEmail: item.order.customer?.email ?? "",
        sellerTotal: lineTotal,
      });
    } else {
      prev.sellerTotal += lineTotal;
      orderMap.set(oid, prev);
    }
  }

  const orders = Array.from(orderMap.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === "PLACED" || o.status === "PROCESSING"
  ).length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const orderValueThisMonth = orders
    .filter((o) => new Date(o.createdAt).getTime() >= monthStart)
    .reduce((sum, o) => sum + o.sellerTotal, 0);

  const lowStockMedicines = medicines
    .filter((m) => (m.stock ?? 0) <= 5)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
    .slice(0, 8);

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Overview"
        description="Track your seller-scoped medicines, stock status, and loaded order activity."
        breadcrumbs={[{ label: "Seller", href: "/seller/dashboard" }, { label: "Overview" }]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          title="This Month Order Value"
          value={money(orderValueThisMonth)}
          icon={ShoppingBag}
          helper="From loaded seller orders"
        />
        <DashboardStatCard
          title="Medicines"
          value={totalMedicines}
          icon={Boxes}
          helper={`${activeMedicines} active listings`}
        />
        <DashboardStatCard
          title="Pending Orders"
          value={pendingOrders}
          icon={AlertTriangle}
          helper={`Out of ${totalOrders} loaded orders`}
        />
        <DashboardStatCard
          title="Out of Stock"
          value={outOfStock}
          icon={PackageX}
          helper="Seller catalogue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardPanel>
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <div className="mt-4">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Seller Total</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((o) => (
                      <TableRow key={o.orderId}>
                        <TableCell className="font-medium">#{o.orderId.slice(0, 8)}</TableCell>
                        <TableCell className="max-w-45 truncate">
                          {o.customerName || o.customerEmail || "—"}
                        </TableCell>
                        <TableCell>{statusBadge(o.status)}</TableCell>
                        <TableCell className="text-right">{money(o.sellerTotal)}</TableCell>
                        <TableCell className="text-right">{formatDate(o.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <h2 className="text-lg font-semibold">Low Stock Medicines</h2>
          <div className="mt-4">
            {lowStockMedicines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No low stock items.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockMedicines.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={m.stock === 0 ? "destructive" : "secondary"}>
                            {m.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{money(toNumber(m.price))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
