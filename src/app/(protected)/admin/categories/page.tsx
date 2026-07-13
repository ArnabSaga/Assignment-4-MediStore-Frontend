"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { clientApi } from "@/lib/client-api";
import type { Category } from "@/types/api";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/dashboard";

const API = {
  list: "/categories?limit=100",
  create: "/admin/categories",
  update: (id: string) => `/admin/categories/${id}`,
  remove: (id: string) => `/admin/categories/${id}`,
} as const;

// Removed local fetch helpers in favor of clientApi

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
      const data = await clientApi<Category[]>(API.list, { method: "GET" });
      setCategories(data ?? []);

      const maxPage = Math.max(1, Math.ceil((data?.length ?? 0) / pageSize));
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
      const data = await clientApi<Category>(API.create, {
        method: "POST",
        body: {
          name,
          description: description ? description : undefined,
        },
      });

      setCategories((prev) => [data, ...prev]);
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
      const data = await clientApi<Category>(API.update(id), {
        method: "PATCH", // Backend says PUT/PATCH, plan says PATCH is preferred or corrected to PATCH
        body: {
          name,
          description: description ? description : null,
        },
      });

      setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
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
      await clientApi<null>(API.remove(c.id), { method: "DELETE" });

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
    <div className="space-y-6">
      <DashboardPageHeader
        title="Categories"
        description="Create and organize medicine categories used by the public catalogue."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Categories" }]}
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
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Short description…"
                disabled={creating}
                rows={3}
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

      <div className="dashboard-toolbar flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search categories"
          className="w-full sm:max-w-md"
        />
      </div>

      <div className="grid gap-3 xl:hidden">
        {loading ? (
          <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
            Loading categories…
          </div>
        ) : pageItems.length === 0 ? (
          <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
            No categories found.
          </div>
        ) : (
          pageItems.map((c) => {
            const busy = busyId === c.id;
            const isEditing = editingId === c.id;

            return (
              <div key={c.id} className="dashboard-mobile-card space-y-3">
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
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description…"
                      disabled={busy}
                      rows={3}
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

      <DashboardPanel className="hidden p-0 xl:block">
        <div className="divide-y">
          <div className="grid grid-cols-[minmax(180px,1fr)_minmax(140px,0.7fr)_minmax(260px,1.5fr)_auto] gap-4 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <div>Category</div>
            <div>Slug</div>
            <div>Description</div>
            <div className="text-right">Actions</div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Loading categories…
            </div>
          ) : pageItems.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No categories found.
            </div>
          ) : (
            pageItems.map((c) => {
              const busy = busyId === c.id;
              const isEditing = editingId === c.id;

              return (
                <div
                  key={c.id}
                  className="grid grid-cols-[minmax(180px,1fr)_minmax(140px,0.7fr)_minmax(260px,1.5fr)_auto] items-start gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    {isEditing ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={busy}
                      />
                    ) : (
                      <>
                        <div className="font-medium">{c.name}</div>
                        <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                          {c.id}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="min-w-0 font-mono text-sm text-muted-foreground">
                    {c.slug}
                  </div>

                  <div className="min-w-0">
                    {isEditing ? (
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description…"
                        disabled={busy}
                        rows={3}
                      />
                    ) : (
                      <p className="max-w-prose break-words text-sm leading-6 text-muted-foreground">
                        {c.description?.trim() ? c.description : "—"}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
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
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
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
    </div>
  );
}
