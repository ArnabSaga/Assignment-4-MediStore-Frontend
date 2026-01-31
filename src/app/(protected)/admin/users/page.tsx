"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBanned: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

async function getJSON<T>(url: string): Promise<T> {
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

async function patchJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
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

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function AdminUsersPage() {
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [users, setUsers] = React.useState<UserRow[]>([]);

  const [q, setQ] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<Role | "ALL">("ALL");
  const [banFilter, setBanFilter] = React.useState<"ALL" | "BANNED" | "ACTIVE">(
    "ALL"
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await getJSON<ApiResponse<UserRow[]>>(`/api/v1/admin/users`);
      if (!res.success) throw new Error(res.message || "Failed to load users");
      setUsers(res.data ?? []);
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
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [users, q, roleFilter, banFilter]);

  const setRow = (updated: UserRow) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const onToggleBan = async (u: UserRow) => {
    setBusyId(u.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await patchJSON<ApiResponse<UserRow>>(
        `/api/v1/admin/users/${u.id}/status`,
        { isBanned: !u.isBanned }
      );

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to update ban status");
      }

      setRow(res.data);
      setSuccess(
        res.data.isBanned
          ? "User banned successfully."
          : "User unbanned successfully."
      );
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
      const res = await patchJSON<ApiResponse<UserRow>>(
        `/api/v1/admin/users/${u.id}/role`,
        { role }
      );

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to change role");
      }

      setRow(res.data);
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
      const res = await delJSON<ApiResponse<null>>(
        `/api/v1/admin/users/${u.id}`
      );
      if (!res.success) throw new Error(res.message || "Failed to delete user");

      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setSuccess("User deleted successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete user");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
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

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, id…"
          className="md:max-w-md"
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as Role | "ALL")}
          >
            <SelectTrigger className="w-45">
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
            onValueChange={(v) =>
              setBanFilter(v as "ALL" | "BANNED" | "ACTIVE")
            }
          >
            <SelectTrigger className="w-45">
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

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  Loading users…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => {
                const busy = busyId === u.id;

                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{u.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {u.email}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
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
                        <SelectTrigger className="w-40">
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
                      <span className="rounded-md border px-2 py-1 text-xs">
                        {u.isBanned ? "BANNED" : "ACTIVE"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="rounded-md border px-2 py-1 text-xs">
                        {u.emailVerified ? "YES" : "NO"}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm">
                      {formatDate(u.createdAt)}
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
    </main>
  );
}
