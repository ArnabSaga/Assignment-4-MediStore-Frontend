"use client";

import * as React from "react";
import Image from "next/image";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string | null;
  phone?: string | null;
  emailVerified?: boolean;
  isBanned?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

const BACKEND_URL = process.env.BACKEND_URL;

type BetterAuthSessionResult =
  | { data: { user: any; session: any } | null; error: null }
  | { data: null; error: { message?: string } };

async function getMeFromSession(): Promise<SessionUser> {
  const res =
    (await authClient.getSession()) as unknown as BetterAuthSessionResult;

  if (res?.error) {
    throw new Error(res.error.message || "Failed to read session.");
  }

  if (!res?.data?.user) {
    throw new Error("Not logged in.");
  }

  const u = res.data.user;

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u.role ?? "SELLER") as Role,
    image: u.image ?? null,
    phone: u.phone ?? null,
    emailVerified: !!u.emailVerified,
    isBanned: !!u.isBanned,
  };
}

async function updateMe(payload: {
  name?: string;
  phone?: string | null;
  image?: string | null;
}): Promise<SessionUser> {
  const res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res
    .json()
    .catch(() => null)) as ApiResponse<SessionUser> | null;

  if (!res.ok) {
    throw new Error(
      json?.message || `Failed to update profile (${res.status})`
    );
  }
  if (!json?.success || !json.data) {
    throw new Error(json?.message || "Failed to update profile");
  }

  return json.data;
}

export default function SellerProfilePage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [user, setUser] = React.useState<SessionUser | null>(null);

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const u = await getMeFromSession();
      setUser(u);
      setName(u.name ?? "");
      setPhone(u.phone ?? "");
      setImageUrl(u.image ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const hasChanges =
    !!user &&
    (name !== (user.name ?? "") ||
      phone !== (user.phone ?? "") ||
      imageUrl !== (user.image ?? ""));

  const onSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateMe({
        name: name.trim(),
        phone: phone.trim() ? phone.trim() : null,
        image: imageUrl.trim() ? imageUrl.trim() : null,
      });

      setUser(updated);
      setSuccess("Profile updated successfully.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to update profile. Ensure PATCH /api/v1/users/me exists."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Seller Profile</h1>
          <p className="text-sm text-muted-foreground">
            View and update your profile information.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading || saving}
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

      {loading ? (
        <div className="rounded-lg border p-6">Loading…</div>
      ) : !user ? (
        <div className="rounded-lg border p-6">No user session found.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      {user.name?.slice(0, 2)?.toUpperCase() ?? "U"}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="text-sm space-y-1">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium">{user.role}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Email Verified</span>
                  <span className="font-medium">
                    {user.emailVerified ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Banned</span>
                  <span className="font-medium">
                    {user.isBanned ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +8801XXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Profile image URL</Label>
                <Input
                  id="image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Use a publicly accessible image URL.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setName(user.name ?? "");
                    setPhone(user.phone ?? "");
                    setImageUrl(user.image ?? "");
                    setSuccess(null);
                    setError(null);
                  }}
                  disabled={saving}
                >
                  Reset
                </Button>

                <Button
                  onClick={() => void onSave()}
                  disabled={saving || !hasChanges}
                >
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>

              <Separator />

              <p className="text-xs text-muted-foreground">
                If saving fails: ensure backend has{" "}
                <span className="font-medium">PATCH /api/v1/users/me</span>.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
