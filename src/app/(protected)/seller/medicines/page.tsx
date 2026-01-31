"use client";

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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Medicines</h1>
          <p className="text-sm text-muted-foreground">
            Manage your products, stock, and availability.
          </p>
        </div>

        <Button asChild className="btn-primary">
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
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-3 pr-4">Medicine</th>
                      <th className="py-3 pr-4">Manufacturer</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">Price</th>
                      <th className="py-3 pr-4">Stock</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 text-right">Actions</th>
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

                        <td className="py-4 pr-4">
                          ${Number(m.price).toFixed(2)}
                        </td>

                        <td className="py-4 pr-4">{m.stock}</td>

                        <td className="py-4 pr-4">
                          {m.isActive ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </td>

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

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {maxPage} • Total {total}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="btn-outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    className="btn-outline"
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
