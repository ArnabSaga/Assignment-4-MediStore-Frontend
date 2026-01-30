"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  ShieldAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { ModeToggle } from "@/components/layout/ModeToggle";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string | null;
};

type BetterAuthSessionResult =
  | { data: { user: any; session: any } | null; error: null }
  | { data: null; error: { message?: string } };

async function getUserFromSession(): Promise<SessionUser | null> {
  const res =
    (await authClient.getSession()) as unknown as BetterAuthSessionResult;

  if (res?.error) return null;
  if (!res?.data?.user) return null;

  const u = res.data.user;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u.role ?? "CUSTOMER") as Role,
    image: u.image ?? null,
  };
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [allowed, setAllowed] = React.useState(false);
  const [user, setUser] = React.useState<SessionUser | null>(null);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      const u = await getUserFromSession();

      if (!mounted) return;

      setUser(u);

      // 🔒 Role guard
      if (!u) {
        router.replace("/login");
        return;
      }

      if (u.role !== "ADMIN") {
        router.replace("/"); // change to "/shop" if you want
        return;
      }

      setAllowed(true);
      setLoading(false);
    })().catch(() => {
      if (!mounted) return;
      router.replace("/login");
    });

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="text-sm text-muted-foreground">
          Loading admin panel…
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r bg-background lg:block">
          <div className="flex h-full flex-col p-4">
            <div className="mb-4 ">
              <Link href="/admin" className="flex items-center mb-4 gap-2">
                <ShieldAlert className="h-5 w-5" />
                <span className="font-semibold">Admin Panel</span>
              </Link>
              <div className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-border bg-card">
                  <Image
                    src="/icons/logo.png"
                    alt="MediStore"
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                    priority
                  />
                </span>
                <span className="text-base font-semibold tracking-tight">
                  Medi<span className="text-[#52796f]">Store</span>
                </span>
              </div>
            </div>

            <Separator className="my-2" />

            <nav className="space-y-1">
              <NavLink
                href="/admin"
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Dashboard"
              />
              <NavLink
                href="/admin/users"
                icon={<Users className="h-4 w-4" />}
                label="Users"
              />
              <NavLink
                href="/admin/orders"
                icon={<ShoppingBag className="h-4 w-4" />}
                label="Orders"
              />
              <NavLink
                href="/admin/categories"
                icon={<Package className="h-4 w-4" />}
                label="Categories"
              />
              <NavLink
                href="/admin/medicines"
                icon={<Package className="h-4 w-4" />}
                label="Medicines"
              />
            </nav>

            <div className="mt-auto pt-4">
              {/* Theme toggle */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ModeToggle />
              </div>
              <Separator className="my-3" />
              <div className="text-xs text-muted-foreground pb-2">
                Signed in as{" "}
                <span className="font-medium text-foreground">
                  {user?.name}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user?.email}
              </div>

              <div className="mt-3 flex gap-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/">Go to site</Link>
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="text-sm text-muted-foreground">
                Welcome,{" "}
                <span className="text-foreground font-medium">
                  {user?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/">View site</Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
