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

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: any;
};

const API = {
  list: "/api/v1/categories",
  create: "/api/v1/categories",
  update: (id: string) => `/api/v1/categories/${id}`,
  remove: (id: string) => `/api/v1/categories/${id}`,
} as const;

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

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
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

function clampText(v: string, left = 12, right = 6) {
  if (!v) return "";
  if (v.length <= left + right + 1) return v;
  return `${v.slice(0, left)}…${v.slice(-right)}`;
}

export default function AdminCategoriesPage() {
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [q, setQ] = React.useState("");

  const [newName, setNewName] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");

  const pageSize = 3;
  const [page, setPage] = React.useState(1);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await readJSON<ApiResponse<Category[]>>(API.list);

      if (!res.success)
        throw new Error(res.message || "Failed to load categories");

      const list = res.data ?? [];
      setCategories(list);

      const maxPage = Math.max(1, Math.ceil(list.length / pageSize));
      setPage((p) => Math.min(p, maxPage));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return (categories ?? [])
      .filter((c) => {
        if (!query) return true;
        return [c.id, c.name, c.slug, c.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, q]);

  React.useEffect(() => {
    setPage(1);
  }, [q]);

  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), maxPage));
  }, [maxPage]);

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditName(c.name ?? "");
    setEditDescription(c.description ?? "");
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const onCreate = async () => {
    const name = newName.trim();
    const description = newDescription.trim();

    if (!name) return;

    setBusyId("create");
    setError(null);
    setSuccess(null);

    try {
      const res = await postJSON<ApiResponse<Category>>(API.create, {
        name,
        description: description ? description : undefined,
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to create category");
      }

      setCategories((prev) => [res.data!, ...prev]);
      setNewName("");
      setNewDescription("");
      setSuccess("Category created successfully.");

      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create category");
    } finally {
      setBusyId(null);
    }
  };

  const onUpdate = async (id: string) => {
    const name = editName.trim();
    const description = editDescription.trim();

    if (!name) return;

    setBusyId(id);
    setError(null);
    setSuccess(null);

    try {
      const res = await putJSON<ApiResponse<Category>>(API.update(id), {
        name,
        description: description ? description : null,
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to update category");
      }

      setCategories((prev) => prev.map((c) => (c.id === id ? res.data! : c)));
      cancelEdit();
      setSuccess("Category updated successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update category");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (c: Category) => {
    const ok = window.confirm(
      `Delete category?\n\n${c.name}\n\nThis may affect medicines under this category.`
    );
    if (!ok) return;

    setBusyId(c.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await delJSON<ApiResponse<null>>(API.remove(c.id));
      if (!res.success)
        throw new Error(res.message || "Failed to delete category");

      setCategories((prev) => prev.filter((x) => x.id !== c.id));
      if (editingId === c.id) cancelEdit();
      setSuccess("Category deleted successfully.");

      const remaining = total - 1;
      const nextMax = Math.max(1, Math.ceil(remaining / pageSize));
      setPage((p) => Math.min(p, nextMax));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete category");
    } finally {
      setBusyId(null);
    }
  };

  const creating = busyId === "create";

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Categories</h1>
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
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border p-4">
          <p className="text-sm">{success}</p>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <p className="text-xs text-muted-foreground mb-2">Name</p>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Antibiotics"
                disabled={creating}
              />
            </div>

            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground mb-2">
                Description (optional)
              </p>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Short description…"
                disabled={creating}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => void onCreate()}
              disabled={creating || !newName.trim()}
            >
              {creating ? "Creating…" : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search categories"
          className="w-full sm:max-w-md"
        />
      </div>

      <div className="grid gap-3 md:hidden">
        {loading ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Loading categories…
          </div>
        ) : pageItems.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            No categories found.
          </div>
        ) : (
          pageItems.map((c) => {
            const busy = busyId === c.id;
            const isEditing = editingId === c.id;

            return (
              <div key={c.id} className="rounded-2xl border p-4 space-y-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Category</div>

                  {isEditing ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      disabled={busy}
                    />
                  ) : (
                    <div className="text-base font-semibold">{c.name}</div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Slug: <span className="font-mono">{c.slug}</span>
                  </div>

                  <div className="text-[11px] text-muted-foreground font-mono">
                    ID: {clampText(c.id, 10, 6)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Description
                  </div>
                  {isEditing ? (
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description…"
                      disabled={busy}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {c.description?.trim() ? c.description : "—"}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => void onUpdate(c.id)}
                      disabled={busy || !editName.trim()}
                    >
                      {busy ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={cancelEdit}
                      disabled={busy}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => startEdit(c)}
                      disabled={!!busyId}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 text-black dark:text-white"
                      onClick={() => void onDelete(c)}
                      disabled={busy || !!busyId}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="hidden md:block rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-65">Category</TableHead>
              <TableHead className="min-w-45">Slug</TableHead>
              <TableHead className="min-w-[320px]">Description</TableHead>
              <TableHead className="text-right min-w-55">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  Loading categories…
                </TableCell>
              </TableRow>
            ) : pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((c) => {
                const busy = busyId === c.id;
                const isEditing = editingId === c.id;

                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="max-w-sm"
                          disabled={busy}
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span>{c.name}</span>
                          <span className="text-[11px] text-muted-foreground truncate max-w-90">
                            {c.id}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      <span className="font-mono">{c.slug}</span>
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description…"
                          disabled={busy}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {c.description ?? "—"}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => void onUpdate(c.id)}
                            disabled={busy || !editName.trim()}
                          >
                            {busy ? "Saving…" : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={busy}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(c)}
                            disabled={!!busyId}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => void onDelete(c)}
                            disabled={busy || !!busyId}
                            className="text-black dark:text-white"
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

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
            >
              Prev
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              disabled={page >= maxPage}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Separator />
    </main>
  );
}
