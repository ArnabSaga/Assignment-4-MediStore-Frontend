"use client";

import * as React from "react";
import Image from "next/image";
import { Copy, RotateCcw } from "lucide-react";

import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

type MeUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  image: string | null;
  role: Role;
  isBanned: boolean;
  createdAt: string;
  updatedAt?: string;
};

export function ProfileForm({ initialMe }: { initialMe: MeUser }) {
  const [me, setMe] = React.useState<MeUser>(initialMe);

  const [name, setName] = React.useState(me.name ?? "");
  const [phone, setPhone] = React.useState(me.phone ?? "");
  const [imageUrl, setImageUrl] = React.useState(me.image ?? "");

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const dirty =
    name !== (me.name ?? "") ||
    phone !== (me.phone ?? "") ||
    imageUrl !== (me.image ?? "");

  const refresh = async () => {
    setError(null);
    setSuccess(null);
    try {
      const latest = await clientApi<MeUser>("/users/me", { method: "GET" });
      setMe(latest);
      setName(latest.name ?? "");
      setPhone(latest.phone ?? "");
      setImageUrl(latest.image ?? "");
    } catch (e: any) {
      setError(e?.message || "Failed to refresh profile");
    }
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: { name?: string; phone?: string; image?: string } = {};

      if (name !== (me.name ?? "")) payload.name = name.trim();
      if (phone !== (me.phone ?? "")) payload.phone = phone.trim();
      if (imageUrl !== (me.image ?? "")) payload.image = imageUrl.trim();

      if (Object.keys(payload).length === 0) {
        setSaving(false);
        return;
      }

      await clientApi<void>("/users/profile", {
        method: "PUT",
        body: payload,
      });

      setSuccess("Saved.");
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setName(me.name ?? "");
    setPhone(me.phone ?? "");
    setImageUrl(me.image ?? "");
    setError(null);
    setSuccess(null);
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(me.id);
      setSuccess("User ID copied.");
      setTimeout(() => setSuccess(null), 1200);
    } catch {
      setError("Could not copy.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Keep your details up to date for faster checkout and support.
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="btn-outline"
            onClick={() => void refresh()}
            disabled={saving}
          >
            Refresh
          </Button>
          <Button onClick={() => void onSave()} disabled={!dirty || saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
          {success}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border bg-muted">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                    N/A
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{me.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {me.email}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Role: {me.role} • {me.isBanned ? "BANNED" : "ACTIVE"}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="image">Photo URL</Label>
              <Input
                id="image"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Use a public image link (some Google links won’t load).
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="btn-outline w-full"
                onClick={reset}
                disabled={!dirty || saving}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold">Account details</p>
              <p className="text-xs text-muted-foreground">
                These details are used for your orders and communication.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={saving}
                  placeholder="e.g. +8801XXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={me.email} disabled />
              </div>

              <div className="space-y-2">
                <Label>Email verified</Label>
                <Input value={me.emailVerified ? "Yes" : "No"} disabled />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={me.role} disabled />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Input value={me.isBanned ? "BANNED" : "ACTIVE"} disabled />
              </div>
            </div>

            <Separator className="my-5" />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="outline"
                className={cn("btn-outline", "sm:w-auto")}
                onClick={() => void copyId()}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
