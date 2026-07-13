"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard";

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
  meta?: Record<string, unknown>;
};

type ApiErrorBody = {
  message?: string;
  error?: string;
};

type RawMedicine = Partial<
  Omit<
    Medicine,
    "id" | "name" | "slug" | "createdAt" | "updatedAt" | "price" | "stock" | "isActive" | "category" | "seller"
  >
> & {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  price?: unknown;
  stock?: unknown;
  isActive?: unknown;
  category?: Category | null;
  seller?: { id: string; name: string } | null;
};

type MedicinePatch = Partial<{
  name: string;
  manufacturer: string;
  price: number;
  stock: number;
  isActive: boolean;
  categoryId: string;
  imageUrl: string | null;
  description: string | null;
}>;

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

  const json = (await res.json().catch(() => null)) as ApiErrorBody | null;
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

  const json = (await res.json().catch(() => null)) as ApiErrorBody | null;
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

  const json = (await res.json().catch(() => null)) as ApiErrorBody | null;
  if (!res.ok)
    throw new Error(json?.message || `Request failed (${res.status})`);
  return json as T;
}

function normalizeMedicine(raw: RawMedicine): Medicine {
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

function clampId(id: string, left = 10, right = 6) {
  if (!id) return "";
  if (id.length <= left + right + 1) return id;
  return `${id.slice(0, left)}…${id.slice(-right)}`;
}

function statusPill(active: boolean) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        active
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
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

export default function AdminMedicinesPage() {
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  const [search, setSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("ALL");

  const [page, setPage] = React.useState(1);
  const limit = 4;

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

  const [hasNext, setHasNext] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const catRes = await readJSON<ApiResponse<Category[]>>(API.categories);
      if (!catRes.success)
        throw new Error(catRes.message || "Failed to load categories");
      setCategories(catRes.data ?? []);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit + 1)); // 👈 important
      if (search.trim()) params.set("search", search.trim());
      if (categoryId !== "ALL") params.set("categoryId", categoryId);

      const medRes = await readJSON<ApiResponse<RawMedicine[]>>(
        API.medicines(params.toString())
      );
      if (!medRes.success)
        throw new Error(medRes.message || "Failed to load medicines");

      const raw = Array.isArray(medRes.data) ? medRes.data : [];
      const list = raw.map(normalizeMedicine);

      setHasNext(list.length > limit);

      setMedicines(list.slice(0, limit));

      if (page > 1 && list.length === 0) {
        setPage(1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load medicines");
      setHasNext(false);
      setMedicines([]);
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
      const payload: MedicinePatch = {};

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

      const res = await putJSON<ApiResponse<RawMedicine>>(
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

      setSuccess("Medicine deleted successfully.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete medicine");
    } finally {
      setBusyId(null);
    }
  };

  const isRowBusy = (id: string) => busyId === id;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Medicines"
        description="Moderate public catalogue listings, stock, and seller-owned medicine details."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Medicines" }]}
        actions={
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading || !!busyId}
        >
          Refresh
        </Button>
        }
      />

      {error ? (
        <div className="dashboard-panel border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="dashboard-panel p-4">
          <p className="text-sm">{success}</p>
        </div>
      ) : null}

      <Card className="dashboard-panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-base">Catalogue controls</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Search by medicine details or narrow the list by category.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> •{" "}
              <span className="font-medium text-foreground">{limit}</span> per page
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_240px_auto] lg:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, manufacturer, description…"
            className="w-full"
            disabled={loading}
          />

            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
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

            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading || page <= 1}
                className="sm:w-auto"
              >
                Prev
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading || !hasNext}
                className="sm:w-auto"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 xl:hidden">
        {loading ? (
          <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
            Loading medicines…
          </div>
        ) : medicines.length === 0 ? (
          <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
            No medicines found.
          </div>
        ) : (
          medicines.map((m) => {
            const busy = isRowBusy(m.id);

            return (
              <div key={m.id} className="dashboard-mobile-card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{m.name}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground font-mono">
                      {clampId(m.id)}
                    </div>
                  </div>
                  {statusPill(m.isActive)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-0.5">
                    <div className="text-xs text-muted-foreground">
                      Category
                    </div>
                    <div className="truncate">{m.category?.name ?? "—"}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs text-muted-foreground">
                      Manufacturer
                    </div>
                    <div className="truncate">{m.manufacturer || "—"}</div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-xs text-muted-foreground">Price</div>
                    <div className="font-medium">{fmtBDT(m.price)}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs text-muted-foreground">Stock</div>
                    <div className="font-medium">{m.stock}</div>
                  </div>

                  <div className="col-span-2 space-y-0.5">
                    <div className="text-xs text-muted-foreground">Seller</div>
                    <div className="truncate">{m.seller?.name ?? "—"}</div>
                  </div>

                  <div className="col-span-2 space-y-0.5">
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(m.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEdit(m)}
                    disabled={busy || !!busyId}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 text-black dark:text-white"
                    onClick={() => void onDelete(m)}
                    disabled={busy || !!busyId}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <DashboardPanel className="hidden p-0 xl:block">
        <div className="divide-y">
          <div className="grid grid-cols-[minmax(260px,1.35fr)_minmax(150px,0.75fr)_minmax(190px,1fr)_minmax(100px,0.55fr)_minmax(120px,0.65fr)_minmax(150px,0.8fr)_auto] gap-4 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <div>Medicine</div>
            <div>Category</div>
            <div>Manufacturer</div>
            <div>Price</div>
            <div>Stock</div>
            <div>Seller</div>
            <div className="text-right">Action</div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Loading medicines…
            </div>
          ) : medicines.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No medicines found.
            </div>
          ) : (
            medicines.map((m) => {
              const busy = isRowBusy(m.id);

              return (
                <div
                  key={m.id}
                  className="grid grid-cols-[minmax(260px,1.35fr)_minmax(150px,0.75fr)_minmax(190px,1fr)_minmax(100px,0.55fr)_minmax(120px,0.65fr)_minmax(150px,0.8fr)_auto] items-center gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-medium">{m.name}</span>
                      {statusPill(m.isActive)}
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                      {m.id}
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      Created {formatDate(m.createdAt)}
                    </div>
                  </div>

                  <div className="min-w-0 truncate text-sm text-muted-foreground">
                    {m.category?.name ?? "—"}
                  </div>

                  <div className="min-w-0 truncate text-sm">
                    {m.manufacturer || "—"}
                  </div>

                  <div className="whitespace-nowrap text-sm font-semibold">
                    {fmtBDT(m.price)}
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${stockTone(
                        m.stock
                      )}`}
                    >
                      {m.stock} • {stockLabel(m.stock)}
                    </span>
                  </div>

                  <div className="min-w-0 truncate text-sm text-muted-foreground">
                    {m.seller?.name ?? "—"}
                  </div>

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
                      className="text-black dark:text-white"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DashboardPanel>

      <Separator />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) closeEdit();
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl sm:w-full">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
            <DialogDescription>
              Update fields and save. Change at least one field.
            </DialogDescription>
          </DialogHeader>

          {!current ? null : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Medicine ID</p>
                <div className="text-xs font-mono text-muted-foreground break-all">
                  {current.id}
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
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
                <p className="text-xs text-muted-foreground">Price</p>
                <Input
                  value={ePrice}
                  onChange={(e) => setEPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder="e.g. 120"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Stock</p>
                <Input
                  value={eStock}
                  onChange={(e) => setEStock(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 50"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Active</p>
                <Select
                  value={eIsActive}
                  onValueChange={(v) => {
                    if (v === "true" || v === "false") setEIsActive(v);
                  }}
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

              <div className="space-y-2 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Image URL</p>
                <Input
                  value={eImageUrl}
                  onChange={(e) => setEImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Description</p>
                <Textarea
                  value={eDescription}
                  onChange={(e) => setEDescription(e.target.value)}
                  placeholder="Short description…"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
    </div>
  );
}
