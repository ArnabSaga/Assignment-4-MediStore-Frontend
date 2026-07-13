"use client";

import * as React from "react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  User2,
  Shield,
} from "lucide-react";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: Role;
  image?: string | null;
};

type BetterAuthSessionUser = SessionUser & {
  role?: Role;
};

type BetterAuthSessionResult =
  | { data: { user: BetterAuthSessionUser; session: unknown } | null; error: null }
  | { data: null; error: { message?: string } };

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

async function getSessionUser(): Promise<SessionUser | null> {
  const res =
    (await authClient.getSession()) as unknown as BetterAuthSessionResult;

  if (!res || res.error || !res.data?.user) return null;

  const u = res.data.user;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    image: u.image ?? null,
  };
}

function RoleChip({ role }: { role: Role }) {
  const label =
    role === "ADMIN" ? "Admin" : role === "SELLER" ? "Seller" : "Customer";
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
      {label}
    </span>
  );
}

function Tile({
  title,
  description,
  href,
  icon: Icon,
  variant = "outline",
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  variant?: "default" | "outline" | "secondary";
}) {
  return (
    <Card className="rounded-2xl border border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-muted">
            <Icon className="h-5 w-5 text-foreground/80" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Button
            asChild
            size="sm"
            variant={variant}
            className="w-full rounded-xl"
          >
            <Link href={href}>Open</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AccountPage() {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      const u = await getSessionUser();
      if (!mounted) return;

      setUser(u);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading your account…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Card className="rounded-2xl border border-border bg-card">
          <CardContent className="p-6">
            <p className="text-sm font-semibold">You’re not signed in</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Please log in to view your account.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="btn-primary rounded-xl">
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="btn-outline rounded-xl"
              >
                <Link href="/register">Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const role = (user.role ?? "CUSTOMER") as Role;

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your profile and preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <RoleChip role={role} />
            <Button
              asChild
              variant="outline"
              className="btn-outline rounded-xl"
            >
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="rounded-2xl border border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="text-sm">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold">
                    {user.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Account status
                </p>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium">{role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Security</span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Shield className="h-4 w-4" /> Standard
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="btn-outline w-full rounded-xl justify-start gap-2"
                >
                  <Link href="/account/profile">
                    <User2 className="h-4 w-4" />
                    Personal info
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="btn-outline w-full rounded-xl justify-start gap-2"
                >
                  <Link href="/account/security">
                    <Shield className="h-4 w-4" />
                    Security
                  </Link>
                </Button>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                You can update your personal information and manage security
                here.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold">Quick actions</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Tile
                  title="Orders"
                  description="Track your orders, view details, and check delivery status."
                  href="/account/orders"
                  icon={ShoppingBag}
                  variant="outline"
                />
                <Tile
                  title="Cart"
                  description="Review items before checkout and update quantities."
                  href="/cart"
                  icon={ShoppingCart}
                  variant="outline"
                />
                <Tile
                  title="Checkout"
                  description="Complete your purchase with Cash on Delivery."
                  href="/checkout"
                  icon={CreditCard}
                  variant="secondary"
                />
              </div>
            </div>

            <Card className="rounded-2xl border border-border bg-card">
              <CardContent className="p-5">
                <p className="text-sm font-semibold">Account details</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Basic information associated with your account.
                </p>

                <div className="mt-5 divide-y divide-border rounded-2xl border border-border">
                  <div className="flex items-center justify-between p-4">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <span className="text-sm font-medium">{role}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    asChild
                    variant="outline"
                    className="btn-outline rounded-xl"
                  >
                    <Link href="/contact">Need help?</Link>
                  </Button>
                  <Button asChild className={cn("btn-primary rounded-xl")}>
                    <Link href="/shop">Browse medicines</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-border bg-muted/40 p-5">
              <p className="text-sm font-semibold">Tip</p>
              <p className="mt-1 text-sm text-muted-foreground">
                For a smoother checkout, keep your shipping address ready before
                placing an order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
