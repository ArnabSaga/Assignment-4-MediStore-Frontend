"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Package,
  ShoppingBag,
  User2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "./ModeToggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { authClient } from "@/lib/auth-client";
import { useSession } from "@/hooks/use-session";

interface MenuItem {
  title: string;
  url: string;
}

interface NavbarProps {
  className?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
    className?: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: { title: string; url: string };
    signup: { title: string; url: string };
  };
}

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

export function Navbar({
  logo = {
    url: "/",
    src: "/icons/logo.png",
    alt: "logo",
    title: "MediStore",
  },
  menu = [
    { title: "Home", url: "/" },
    { title: "Shop", url: "/shop" },
    { title: "About", url: "/about" },
    { title: "Contact", url: "/contact" },
  ],
  auth = {
    login: { title: "Login", url: "/login" },
    signup: { title: "Register", url: "/register" },
  },
  className,
}: NavbarProps) {
  const { loading, user, refresh } = useSession();

  const [hidden, setHidden] = React.useState(false);
  const lastY = React.useRef(0);
  const ticking = React.useRef(false);

  React.useEffect(() => {
    lastY.current = window.scrollY;

    const THRESHOLD = 12;
    const HIDE_AFTER = 80;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (y < HIDE_AFTER) {
        setHidden(false);
        lastY.current = y;
        ticking.current = false;
        return;
      }

      if (Math.abs(delta) < THRESHOLD) {
        ticking.current = false;
        return;
      }

      setHidden(delta > 0);
      lastY.current = y;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const role = user?.role;
  const routes =
    role === "SELLER"
      ? {
          dashboard: "/seller/dashboard",
          orders: "/seller/orders",
          profile: "/seller/profile", 
          secondary: {
            href: "/seller/medicines",
            label: "Medicines",
            icon: Package,
          },
        }
      : {
          dashboard: "/account",
          orders: "/account/orders",
          profile: "/account/profile",
          secondary: {
            href: "/account/cart",
            label: "Cart",
            icon: ShoppingBag,
          },
        };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      await refresh();
      window.location.href = "/";
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="h-16" />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 transition-transform duration-200 ease-out",
          hidden ? "-translate-y-full" : "translate-y-0",
          className
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="group inline-flex items-center gap-3">
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
              <p>
                Medi<span className="text-[#52796f]">Store</span>
              </p>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {menu.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.url}
                        className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors hover:bg-muted"
                      >
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <ModeToggle />

            {loading ? null : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-outline gap-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.image ?? undefined} />
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-35 truncate">
                      {user.name ?? "Account"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name ?? "Account"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email ?? ""}
                    </p>
                    {role ? (
                      <p className="text-[11px] text-muted-foreground">
                        Role: {role}
                      </p>
                    ) : null}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      href={routes.dashboard}
                      className="flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={routes.orders}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={routes.secondary.href}
                      className="flex items-center gap-2"
                    >
                      <routes.secondary.icon className="h-4 w-4" />
                      {routes.secondary.label}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={routes.profile}
                      className="flex items-center gap-2"
                    >
                      <User2 className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="btn-outline"
                >
                  <Link href={auth.login.url}>{auth.login.title}</Link>
                </Button>
                <Button asChild size="sm" className="btn-primary">
                  <Link href={auth.signup.url}>{auth.signup.title}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <ModeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="btn-outline">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle>
                    <Link href={logo.url} className="flex items-center gap-2">
                      <Image
                        width={28}
                        height={28}
                        src={logo.src}
                        alt={logo.alt}
                        className="h-7 w-7 dark:invert"
                      />
                      <span className="text-base font-semibold tracking-tight">
                        {logo.title}
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 flex flex-col gap-2">
                  {menu.map((item) => (
                    <Link
                      key={item.title}
                      href={item.url}
                      className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  {loading ? null : user ? (
                    <>
                      <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {user.name ?? "Account"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email ?? ""}
                          </p>
                          {role ? (
                            <p className="text-[11px] text-muted-foreground">
                              Role: {role}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <Button asChild variant="outline" className="btn-outline">
                        <Link href={routes.dashboard}>Dashboard</Link>
                      </Button>

                      <Button asChild variant="outline" className="btn-outline">
                        <Link href={routes.orders}>Orders</Link>
                      </Button>

                      <Button asChild variant="outline" className="btn-outline">
                        <Link href={routes.secondary.href}>
                          {routes.secondary.label}
                        </Link>
                      </Button>

                      <Button asChild variant="outline" className="btn-outline">
                        <Link href={routes.profile}>Profile</Link>
                      </Button>

                      <Button
                        variant="outline"
                        className="btn-outline"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="btn-outline">
                        <Link href={auth.login.url}>{auth.login.title}</Link>
                      </Button>
                      <Button asChild className="btn-primary">
                        <Link href={auth.signup.url}>{auth.signup.title}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
