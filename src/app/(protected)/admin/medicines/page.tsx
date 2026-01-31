"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Medicine = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  manufacturer: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  seller?: { id: string; name: string } | null;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: any;
};

const API = {
  categories: "/api/v1/categories",
  medicines: (qs: string) => `/api/v1/medicines?${qs}`,
  adminMedicine: (id: string) => `/api/v1/admin/medicines/${id}`, 
} as const;

function toNumber(v: unknown, fallback = 0) {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? fallback : n;
  }
  return fallback;
}

function fmtBDT(amount: number) {
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

async function readJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok)
    throw new Error(json?.message || `Request failed (${res.status})`);
  return json as T;
}

async function putJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok)
    throw new Error(json?.message || `Request failed (${res.status})`);
  return json as T;
}

async function delJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok)
    throw new Error(json?.message || `Request failed (${res.status})`);
  return json as T;
}

function normalizeMedicine(raw: any): Medicine {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
    imageUrl: raw.imageUrl ?? null,
    isActive: !!raw.isActive,
    manufacturer: raw.manufacturer ?? "",
    price: toNumber(raw.price, 0),
    stock: toNumber(raw.stock, 0),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    category: raw.category ?? null,
    seller: raw.seller ?? null,
  };
}

export default function AdminMedicinesPage() {
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  //* Filters
  const [search, setSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);

  //* Edit dialog state
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<Medicine | null>(null);

  const [eName, setEName] = React.useState("");
  const [eManufacturer, setEManufacturer] = React.useState("");
  const [ePrice, setEPrice] = React.useState("");
  const [eStock, setEStock] = React.useState("");
  const [eCategoryId, setECategoryId] = React.useState<string>("");
  const [eIsActive, setEIsActive] = React.useState<"true" | "false">("true");
  const [eImageUrl, setEImageUrl] = React.useState("");
  const [eDescription, setEDescription] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      //* categories
      const catRes = await readJSON<ApiResponse<Category[]>>(API.categories);
      if (!catRes.success)
        throw new Error(catRes.message || "Failed to load categories");
      setCategories(catRes.data ?? []);

      //* medicines list (public)
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      if (categoryId !== "ALL") params.set("categoryId", categoryId);

      const medRes = await readJSON<ApiResponse<any[]>>(
        API.medicines(params.toString())
      );
      if (!medRes.success)
        throw new Error(medRes.message || "Failed to load medicines");

      const list = Array.isArray(medRes.data)
        ? medRes.data.map(normalizeMedicine)
        : [];
      setMedicines(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, categoryId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    setPage(1);
  }, [search, categoryId]);

  const openEdit = (m: Medicine) => {
    setCurrent(m);
    setEName(m.name ?? "");
    setEManufacturer(m.manufacturer ?? "");
    setEPrice(String(m.price ?? ""));
    setEStock(String(m.stock ?? ""));
    setECategoryId(m.category?.id ?? "");
    setEIsActive(m.isActive ? "true" : "false");
    setEImageUrl(m.imageUrl ?? "");
    setEDescription(m.description ?? "");
    setError(null);
    setSuccess(null);
    setOpen(true);
  };

  const closeEdit = () => {
    setOpen(false);
    setCurrent(null);
  };

  const updateLocal = (updated: Medicine) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  const onSave = async () => {
    if (!current) return;

    setBusyId(current.id);
    setError(null);
    setSuccess(null);

    try {
      const payload: any = {};

      const name = eName.trim();
      const manufacturer = eManufacturer.trim();
      const imageUrl = eImageUrl.trim();
      const description = eDescription.trim();

      const priceNum = Number(ePrice);
      const stockNum = Number(eStock);

      if (name !== current.name) payload.name = name;
      if (manufacturer !== current.manufacturer)
        payload.manufacturer = manufacturer;

      if (!Number.isNaN(priceNum) && priceNum !== current.price)
        payload.price = priceNum;
      if (!Number.isNaN(stockNum) && stockNum !== current.stock)
        payload.stock = Math.trunc(stockNum);

      const isActiveBool = eIsActive === "true";
      if (isActiveBool !== current.isActive) payload.isActive = isActiveBool;

      const currCatId = current.category?.id ?? "";
      if (eCategoryId && eCategoryId !== currCatId)
        payload.categoryId = eCategoryId;

      if ((imageUrl || "") !== (current.imageUrl ?? ""))
        payload.imageUrl = imageUrl ? imageUrl : null;
      if ((description || "") !== (current.description ?? ""))
        payload.description = description ? description : null;

      if (Object.keys(payload).length === 0) {
        setSuccess("Nothing to update.");
        setBusyId(null);
        return;
      }

      const res = await putJSON<ApiResponse<any>>(
        API.adminMedicine(current.id),
        payload
      );
      if (!res.success || !res.data)
        throw new Error(res.message || "Failed to update medicine");

      const updated = normalizeMedicine(res.data);
      updateLocal(updated);
      setSuccess("Medicine updated successfully.");
      closeEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update medicine");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (m: Medicine) => {
    const ok = window.confirm(
      `Delete medicine?\n\n${m.name}\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setBusyId(m.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await delJSON<ApiResponse<null>>(API.adminMedicine(m.id));
      if (!res.success)
        throw new Error(res.message || "Failed to delete medicine");

      setMedicines((prev) => prev.filter((x) => x.id !== m.id));
      setSuccess("Medicine deleted successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete medicine");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Medicines</h1>
        </div>

        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading || !!busyId}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border p-4">
          <p className="text-sm">{success}</p>
        </div>
      ) : null}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, manufacturer, description…"
            className="md:max-w-md"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-55">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  Loading medicines…
                </TableCell>
              </TableRow>
            ) : medicines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  No medicines found.
                </TableCell>
              </TableRow>
            ) : (
              medicines.map((m) => {
                const busy = busyId === m.id;

                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="truncate">{m.name}</span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {m.id}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {m.category?.name ?? "-"}
                    </TableCell>

                    <TableCell className="text-sm">{m.manufacturer}</TableCell>

                    <TableCell className="text-right">
                      {fmtBDT(m.price)}
                    </TableCell>

                    <TableCell className="text-right">{m.stock}</TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {m.seller?.name ?? "-"}
                    </TableCell>

                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatDate(m.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(m)}
                          disabled={busy || !!busyId}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void onDelete(m)}
                          disabled={busy || !!busyId}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Separator />

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
            <DialogDescription>
              Update fields and save. Backend rejects empty updates, so change
              at least one field.
            </DialogDescription>
          </DialogHeader>

          {!current ? null : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Name</p>
                <Input
                  value={eName}
                  onChange={(e) => setEName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Manufacturer</p>
                <Input
                  value={eManufacturer}
                  onChange={(e) => setEManufacturer(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Price</p>
                <Input
                  value={ePrice}
                  onChange={(e) => setEPrice(e.target.value)}
                  placeholder="e.g. 120"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Stock</p>
                <Input
                  value={eStock}
                  onChange={(e) => setEStock(e.target.value)}
                  placeholder="e.g. 50"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Category</p>
                <Select value={eCategoryId} onValueChange={setECategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Active</p>
                <Select
                  value={eIsActive}
                  onValueChange={(v) => setEIsActive(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Active" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <p className="text-xs text-muted-foreground">Image URL</p>
                <Input
                  value={eImageUrl}
                  onChange={(e) => setEImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <p className="text-xs text-muted-foreground">Description</p>
                <Input
                  value={eDescription}
                  onChange={(e) => setEDescription(e.target.value)}
                  placeholder="Short description…"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeEdit} disabled={!!busyId}>
              Cancel
            </Button>
            <Button
              onClick={() => void onSave()}
              disabled={!current || busyId === current?.id}
            >
              {busyId === current?.id ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
