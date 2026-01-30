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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/* ----------------------------- fetch helpers ----------------------------- */

async function readJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
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
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok)
    throw new Error(json?.message || `Request failed (${res.status})`);
  return json as T;
}

async function putJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT", // ✅ backend uses PUT for update
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok)
    throw new Error(json?.message || `Request failed (${res.status})`);
  return json as T;
}

/* --------------------------------- page --------------------------------- */

export default function AdminCategoriesPage() {
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [q, setQ] = React.useState("");

  // Create form
  const [newName, setNewName] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");

  // Edit state
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await readJSON<ApiResponse<Category[]>>(
        `${API_BASE}/api/v1/categories`
      );

      if (!res.success)
        throw new Error(res.message || "Failed to load categories");

      setCategories(res.data ?? []);
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
      const res = await postJSON<ApiResponse<Category>>(
        `${API_BASE}/api/v1/categories`,
        {
          name,
          // backend may ignore description if not supported; safe to send
          description: description ? description : undefined,
        }
      );

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to create category");
      }

      // add newest on top (or you can reload)
      setCategories((prev) => [res.data!, ...prev]);
      setNewName("");
      setNewDescription("");
      setSuccess("Category created successfully.");
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
      const res = await putJSON<ApiResponse<Category>>(
        `${API_BASE}/api/v1/categories/${id}`,
        {
          name,
          description: description ? description : null,
        }
      );

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
      const res = await delJSON<ApiResponse<null>>(
        `${API_BASE}/api/v1/categories/${c.id}`
      );

      if (!res.success)
        throw new Error(res.message || "Failed to delete category");

      setCategories((prev) => prev.filter((x) => x.id !== c.id));
      if (editingId === c.id) cancelEdit();
      setSuccess("Category deleted successfully.");
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
        <div className="rounded-lg border p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border p-4">
          <p className="text-sm">{success}</p>
        </div>
      ) : null}

      {/* Create */}
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

          <p className="text-xs text-muted-foreground">
            Slug is generated automatically by the backend.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search categories by name/slug/description…"
          className="md:max-w-md"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  Loading categories…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => {
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
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span>{c.name}</span>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {c.id}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {c.slug}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description…"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {c.description ?? "-"}
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

      <Separator />
    </main>
  );
}
