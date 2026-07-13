"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DashboardPageHeader, DashboardPanel } from "@/components/dashboard";

import { clientApi } from "@/lib/client-api";
import type { Medicine } from "@/types/api";

function formatMoney(amount: unknown) {
  const n = typeof amount === "number" ? amount : typeof amount === "string" ? Number(amount) : 0;

  const safe = Number.isFinite(n) ? n : 0;

  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `৳${safe.toFixed(2)}`;
  }
}

function toNumber(amount: unknown) {
  const n =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount)
        : 0;

  return Number.isFinite(n) ? n : 0;
}

function statusPill(active: boolean) {
  return active ? (
    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Active</Badge>
  ) : (
    <Badge variant="secondary">Inactive</Badge>
  );
}

function clampText(v: string, left = 18, right = 8) {
  if (!v) return "";
  if (v.length <= left + right + 1) return v;
  return `${v.slice(0, left)}…${v.slice(-right)}`;
}

function stockTone(stock: number) {
  if (stock <= 0) {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  if (stock <= 10) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}

function stockLabel(stock: number) {
  if (stock <= 0) return "Out of stock";
  if (stock <= 10) return "Low stock";
  return "In stock";
}

export default function SellerMedicinesPage() {
  const [loading, setLoading] = React.useState(true);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Medicine | null>(null);
  const [editPrice, setEditPrice] = React.useState("");
  const [editStock, setEditStock] = React.useState("");

  const [page, setPage] = React.useState(1);
  const pageSize = 5;

  const fetchMedicines = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await clientApi<Medicine[]>("/seller/medicines?limit=100");
      setMedicines(list);

      const nextMaxPage = Math.max(1, Math.ceil(list.length / pageSize));
      setPage((p) => Math.min(p, nextMaxPage));
    } catch {
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchMedicines();
  }, [fetchMedicines]);

  const handleDelete = async (medicineId: string) => {
    if (deletingId || savingId) return;

    const t = toast.loading("Deleting medicine...");
    setDeletingId(medicineId);

    try {
      await clientApi(`/seller/medicines/${medicineId}`, {
        method: "DELETE",
      });

      toast.success("Deleted ✅", { id: t });

      setMedicines((prev) => {
        const next = prev.filter((m) => m.id !== medicineId);
        const nextMaxPage = Math.max(1, Math.ceil(next.length / pageSize));
        setPage((p) => Math.min(p, nextMaxPage));
        return next;
      });
    } catch {
      toast.error("Delete failed", { id: t });
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (medicine: Medicine) => {
    setEditing(medicine);
    setEditPrice(String(toNumber(medicine.price)));
    setEditStock(String(medicine.stock ?? 0));
  };

  const closeEdit = () => {
    setEditing(null);
    setEditPrice("");
    setEditStock("");
  };

  const handleSave = async () => {
    if (!editing || savingId) return;

    const price = Number(editPrice);
    const stock = Number(editStock);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Stock must be a whole number and cannot be negative");
      return;
    }

    const currentPrice = toNumber(editing.price);
    const payload: Partial<Pick<Medicine, "price" | "stock">> = {};

    if (price !== currentPrice) payload.price = price;
    if (stock !== editing.stock) payload.stock = stock;

    if (Object.keys(payload).length === 0) {
      toast.info("No price or stock changes to save");
      closeEdit();
      return;
    }

    const t = toast.loading("Updating medicine...");
    setSavingId(editing.id);

    try {
      const updated = await clientApi<Medicine>(`/seller/medicines/${editing.id}`, {
        method: "PATCH",
        body: payload,
      });

      setMedicines((prev) =>
        prev.map((medicine) => (medicine.id === updated.id ? updated : medicine))
      );
      toast.success("Medicine updated", { id: t });
      closeEdit();
    } catch {
      toast.error("Update failed", { id: t });
    } finally {
      setSavingId(null);
    }
  };

  const total = medicines.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = medicines.slice(start, end);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Medicines"
        description="Manage your products, stock, and availability."
        breadcrumbs={[{ label: "Seller", href: "/seller/dashboard" }, { label: "Medicines" }]}
        actions={
        <Button asChild className="btn-primary w-full sm:w-auto">
          <Link href="/seller/medicines/new">+ Add Medicine</Link>
        </Button>
        }
      />

      <Card className="dashboard-panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-base">Your Medicines</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Update pricing and stock directly from your catalogue.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of{" "}
              <span className="font-medium text-foreground">{maxPage}</span> •{" "}
              <span className="font-medium text-foreground">{total}</span> total
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
              Loading medicines…
            </div>
          ) : medicines.length === 0 ? (
            <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
              No medicines found. Create one.
            </div>
          ) : (
            <>
              <div className="grid gap-3 xl:hidden">
                {pageItems.map((m) => {
                  const busy = deletingId === m.id || savingId === m.id;
                  const stock = Number(m.stock ?? 0);

                  return (
                    <div key={m.id} className="dashboard-mobile-card space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{m.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {clampText(m.slug!)}
                          </div>
                        </div>
                        {statusPill(m.isActive ?? false)}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Manufacturer</div>
                          <div className="truncate">{m.manufacturer}</div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Category</div>
                          <div className="truncate">{m.category?.name ?? "—"}</div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Price</div>
                          <div className="font-medium">{formatMoney(m.price)}</div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Stock</div>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${stockTone(
                              stock
                            )}`}
                          >
                            {stock} • {stockLabel(stock)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="btn-outline"
                          disabled={busy}
                          onClick={() => openEdit(m)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="btn-outline"
                          disabled={busy}
                          onClick={() => void handleDelete(m.id)}
                        >
                          {deletingId === m.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <DashboardPanel className="hidden p-0 xl:block">
                <div className="divide-y">
                  <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(90px,0.45fr)_minmax(128px,0.65fr)_128px] gap-3 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <div>Medicine</div>
                    <div>Details</div>
                    <div>Price</div>
                    <div>Stock</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {pageItems.map((m) => {
                    const busy = deletingId === m.id || savingId === m.id;
                    const stock = Number(m.stock ?? 0);

                    return (
                      <div
                        key={m.id}
                        className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(90px,0.45fr)_minmax(128px,0.65fr)_128px] items-center gap-3 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate font-medium">{m.name}</span>
                            {statusPill(m.isActive ?? false)}
                          </div>
                          <div className="mt-1 truncate text-xs text-muted-foreground">
                            {m.slug}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm">{m.manufacturer || "—"}</div>
                          <div className="mt-1 truncate text-xs text-muted-foreground">
                            {m.category?.name ?? "—"}
                          </div>
                        </div>

                        <div className="whitespace-nowrap text-sm font-semibold">
                          {formatMoney(m.price)}
                        </div>

                        <div>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${stockTone(
                              stock
                            )}`}
                          >
                            {stock} • {stockLabel(stock)}
                          </span>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="btn-outline px-3"
                            disabled={busy}
                            onClick={() => openEdit(m)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="btn-outline px-3"
                            disabled={busy}
                            onClick={() => void handleDelete(m.id)}
                          >
                            {deletingId === m.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DashboardPanel>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {maxPage} • Total {total}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="btn-outline w-full sm:w-auto"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    className="btn-outline w-full sm:w-auto"
                    onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                    disabled={page >= maxPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !savingId) closeEdit();
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle>Update price and stock</DialogTitle>
            <DialogDescription>
              Adjust live catalogue pricing and inventory for this medicine.
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="space-y-4">
              <div className="rounded-xl border bg-background/45 p-3">
                <div className="font-medium">{editing.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {editing.manufacturer} • {editing.category?.name ?? "Uncategorized"}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="seller-medicine-price"
                    className="text-xs text-muted-foreground"
                  >
                    Price
                  </label>
                  <Input
                    id="seller-medicine-price"
                    value={editPrice}
                    onChange={(event) => setEditPrice(event.target.value)}
                    inputMode="decimal"
                    placeholder="e.g. 50"
                    disabled={savingId === editing.id}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="seller-medicine-stock"
                    className="text-xs text-muted-foreground"
                  >
                    Stock
                  </label>
                  <Input
                    id="seller-medicine-stock"
                    value={editStock}
                    onChange={(event) => setEditStock(event.target.value)}
                    inputMode="numeric"
                    placeholder="e.g. 18"
                    disabled={savingId === editing.id}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={closeEdit}
              disabled={!!savingId}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={!editing || savingId === editing.id}
            >
              {editing && savingId === editing.id ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
