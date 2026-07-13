"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Role, CurrentUser as UserRow } from "@/types/api";

const API = {
  list: "/admin/users?limit=100",
  status: (id: string) => `/admin/users/${id}/status`,
  role: (id: string) => `/admin/users/${id}/role`,
  remove: (id: string) => `/admin/users/${id}`,
} as const;

// Removed local fetch helpers in favor of clientApi

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function clampId(id: string) {
  if (!id) return "";
  return id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

export default function AdminUsersPage() {
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [users, setUsers] = React.useState<UserRow[]>([]);

  const [q, setQ] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<Role | "ALL">("ALL");
  const [banFilter, setBanFilter] = React.useState<"ALL" | "BANNED" | "ACTIVE">("ALL");

  const pageSize = 6;
  const [page, setPage] = React.useState(1);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await clientApi<UserRow[]>(API.list, { method: "GET" });
      setUsers(data ?? []);

      const maxPage = Math.max(1, Math.ceil((data?.length ?? 0) / pageSize));
      setPage((p) => Math.min(p, maxPage));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    return users
      .filter((u) => (roleFilter === "ALL" ? true : u.role === roleFilter))
      .filter((u) => {
        if (banFilter === "ALL") return true;
        if (banFilter === "BANNED") return u.isBanned;
        return !u.isBanned;
      })
      .filter((u) => {
        if (!query) return true;
        const hay = [u.id, u.name, u.email, u.role].join(" ").toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => (a.createdAt! < b.createdAt! ? 1 : -1));
  }, [users, q, roleFilter, banFilter]);

  React.useEffect(() => {
    setPage(1);
  }, [q, roleFilter, banFilter]);

  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), maxPage));
  }, [maxPage]);

  const setRow = (updated: UserRow) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const onToggleBan = async (u: UserRow) => {
    setBusyId(u.id);
    setError(null);
    setSuccess(null);

    try {
      const data = await clientApi<UserRow>(API.status(u.id), {
        method: "PATCH",
        body: { isBanned: !u.isBanned },
      });

      setRow(data);
      setSuccess(data.isBanned ? "User banned successfully." : "User unbanned successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update ban status");
    } finally {
      setBusyId(null);
    }
  };

  const onChangeRole = async (u: UserRow, role: Role) => {
    if (u.role === role) return;

    setBusyId(u.id);
    setError(null);
    setSuccess(null);

    try {
      const data = await clientApi<UserRow>(API.role(u.id), {
        method: "PATCH",
        body: { role },
      });

      setRow(data);
      setSuccess("User role updated successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to change role");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (u: UserRow) => {
    const ok = window.confirm(
      `Delete user?\n\nName: ${u.name}\nEmail: ${u.email}\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setBusyId(u.id);
    setError(null);
    setSuccess(null);

    try {
      await clientApi<null>(API.remove(u.id), { method: "DELETE" });

      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setSuccess("User deleted successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete user");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Users"
        description="Manage marketplace accounts, access roles, and account safety states."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
        actions={
        <Button variant="outline" onClick={() => void load()} disabled={loading || !!busyId}>
          Refresh
        </Button>
        }
      />

      {error ? (
        <div className="dashboard-panel border-destructive/30 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="dashboard-panel p-4">
          <p className="text-sm">{success}</p>
        </div>
      ) : null}

      <div className="dashboard-toolbar flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, id…"
          className="w-full lg:max-w-md"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:gap-3">
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "ALL")}>
            <SelectTrigger className="w-full sm:w-auto sm:min-w-45">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
              <SelectItem value="SELLER">SELLER</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={banFilter}
            onValueChange={(v) => setBanFilter(v as "ALL" | "BANNED" | "ACTIVE")}
          >
            <SelectTrigger className="w-full sm:w-auto sm:min-w-45">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="BANNED">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {loading ? (
          <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
            Loading users…
          </div>
        ) : pageItems.length === 0 ? (
          <div className="dashboard-panel p-6 text-center text-sm text-muted-foreground">
            No users found.
          </div>
        ) : (
          pageItems.map((u) => {
            const busy = busyId === u.id;

            return (
              <div key={u.id} className="dashboard-mobile-card space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">{u.name}</div>
                  <div className="text-xs text-muted-foreground break-all">{u.email}</div>
                  <div className="text-[11px] text-muted-foreground">
                    ID: <span className="font-mono">{clampId(u.id)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Role</div>
                    <Select
                      value={u.role}
                      onValueChange={(v) => void onChangeRole(u, v as Role)}
                      disabled={busy}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
                        <SelectItem value="SELLER">SELLER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <span className="inline-flex w-fit rounded-md border px-2 py-1 text-xs">
                      {u.isBanned ? "BANNED" : "ACTIVE"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Verified</div>
                    <span className="inline-flex w-fit rounded-md border px-2 py-1 text-xs">
                      {u.emailVerified ? "YES" : "NO"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div className="text-sm">{formatDate(u.createdAt!)}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={u.isBanned ? "secondary" : "outline"}
                    onClick={() => void onToggleBan(u)}
                    disabled={busy}
                    className="flex-1"
                  >
                    {busy ? "..." : u.isBanned ? "Unban" : "Ban"}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void onDelete(u)}
                    disabled={busy}
                    className="flex-1 text-black dark:text-white"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <DashboardPanel className="hidden overflow-hidden p-0 md:block">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-65">User</TableHead>
              <TableHead className="min-w-50">Role</TableHead>
              <TableHead className="min-w-30">Status</TableHead>
              <TableHead className="min-w-30">Verified</TableHead>
              <TableHead className="min-w-45">Created</TableHead>
              <TableHead className="text-right min-w-55">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  Loading users…
                </TableCell>
              </TableRow>
            ) : pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((u) => {
                const busy = busyId === u.id;

                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-105">
                          {u.id}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(v) => void onChangeRole(u, v as Role)}
                        disabled={busy}
                      >
                        <SelectTrigger className="w-45">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
                          <SelectItem value="SELLER">SELLER</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <span className="rounded-md border px-2 py-1 text-xs whitespace-nowrap">
                        {u.isBanned ? "BANNED" : "ACTIVE"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="rounded-md border px-2 py-1 text-xs whitespace-nowrap">
                        {u.emailVerified ? "YES" : "NO"}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(u.createdAt!)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant={u.isBanned ? "secondary" : "outline"}
                          onClick={() => void onToggleBan(u)}
                          disabled={busy}
                        >
                          {busy ? "..." : u.isBanned ? "Unban" : "Ban"}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void onDelete(u)}
                          disabled={busy}
                          className="text-black dark:text-white"
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
    </div>
  );
}
