"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Medicine = {
  id: string;
  name: string;
  slug: string;
  manufacturer: string;
  price: number;
  stock: number;
  isActive: boolean;
  category?: { id: string; name: string; slug: string } | null;
};

function formatMoney(amount: unknown) {
  const n =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount)
        : 0;

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

function statusPill(active: boolean) {
  return active ? (
    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
      Active
    </Badge>
  ) : (
    <Badge variant="secondary">Inactive</Badge>
  );
}

function clampText(v: string, left = 18, right = 8) {
  if (!v) return "";
  if (v.length <= left + right + 1) return v;
  return `${v.slice(0, left)}…${v.slice(-right)}`;
}

export default function SellerMedicinesPage() {
  const [loading, setLoading] = React.useState(true);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const [page, setPage] = React.useState(1);
  const pageSize = 5;

  const fetchMedicines = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/seller/medicines`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.log("FETCH MEDICINES FAILED:", res.status, text);
        toast.error("Failed to load medicines");
        return;
      }

      const json = (await res.json().catch(() => null)) as {
        success: boolean;
        data: Medicine[];
        message?: string;
      } | null;

      if (!json?.success) {
        toast.error(json?.message || "Failed to load medicines");
        return;
      }

      const list = json.data ?? [];
      setMedicines(list);

      const nextMaxPage = Math.max(1, Math.ceil(list.length / pageSize));
      setPage((p) => Math.min(p, nextMaxPage));
    } catch (e) {
      console.log(e);
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchMedicines();
  }, [fetchMedicines]);

  const handleDelete = async (medicineId: string) => {
    if (deletingId) return;

    const t = toast.loading("Deleting medicine...");
    setDeletingId(medicineId);

    try {
      const res = await fetch(`/api/v1/seller/medicines/${medicineId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.log("DELETE FAILED:", res.status, text);
        toast.error("Delete failed", { id: t });
        return;
      }

      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (json && json.success === false) {
        toast.error(json.message || "Delete failed", { id: t });
        return;
      }

      toast.success("Deleted ✅", { id: t });

      setMedicines((prev) => {
        const next = prev.filter((m) => m.id !== medicineId);
        const nextMaxPage = Math.max(1, Math.ceil(next.length / pageSize));
        setPage((p) => Math.min(p, nextMaxPage));
        return next;
      });
    } catch (e) {
      console.log(e);
      toast.error("Delete failed", { id: t });
    } finally {
      setDeletingId(null);
    }
  };

  const total = medicines.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = medicines.slice(start, end);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Medicines</h1>
          <p className="text-sm text-muted-foreground">
            Manage your products, stock, and availability.
          </p>
        </div>

        <Button asChild className="btn-primary w-full sm:w-auto">
          <Link href="/seller/medicines/new">+ Add Medicine</Link>
        </Button>
      </div>

      <Card className="border-border bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Your Medicines</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : medicines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No medicines found. Create one.
            </p>
          ) : (
            <>
              {/* ✅ Mobile layout (cards) */}
              <div className="grid gap-3 sm:hidden">
                {pageItems.map((m) => {
                  const busy = deletingId === m.id;

                  return (
                    <div
                      key={m.id}
                      className="rounded-2xl border p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{m.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {clampText(m.slug)}
                          </div>
                        </div>
                        {statusPill(m.isActive)}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">
                            Manufacturer
                          </div>
                          <div className="truncate">{m.manufacturer}</div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">
                            Category
                          </div>
                          <div className="truncate">
                            {m.category?.name ?? "—"}
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">
                            Price
                          </div>
                          <div className="font-medium">
                            {formatMoney(m.price)}
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">
                            Stock
                          </div>
                          <div className="font-medium">{m.stock}</div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="btn-outline w-full"
                        disabled={busy}
                        onClick={() => void handleDelete(m.id)}
                      >
                        {busy ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="hidden sm:block w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-3 pr-4 min-w-55">Medicine</th>
                      <th className="py-3 pr-4 min-w-40">Manufacturer</th>
                      <th className="py-3 pr-4 min-w-40">Category</th>
                      <th className="py-3 pr-4 whitespace-nowrap">Price</th>
                      <th className="py-3 pr-4 whitespace-nowrap">Stock</th>
                      <th className="py-3 pr-4 whitespace-nowrap">Status</th>
                      <th className="py-3 text-right whitespace-nowrap min-w-30">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pageItems.map((m) => (
                      <tr key={m.id} className="border-b last:border-b-0">
                        <td className="py-4 pr-4">
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {m.slug}
                          </div>
                        </td>

                        <td className="py-4 pr-4">{m.manufacturer}</td>

                        <td className="py-4 pr-4">{m.category?.name ?? "—"}</td>

                        <td className="py-4 pr-4 whitespace-nowrap">
                          {formatMoney(m.price)}
                        </td>

                        <td className="py-4 pr-4 whitespace-nowrap">
                          {m.stock}
                        </td>

                        <td className="py-4 pr-4">{statusPill(m.isActive)}</td>

                        <td className="py-4 text-right">
                          <Button
                            variant="outline"
                            className="btn-outline"
                            disabled={deletingId === m.id}
                            onClick={() => void handleDelete(m.id)}
                          >
                            {deletingId === m.id ? "Deleting..." : "Delete"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
    </div>
  );
}
