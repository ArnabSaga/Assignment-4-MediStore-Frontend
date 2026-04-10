"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  User2,
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

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
import { useCartStore } from "@/lib/cart-store";

type Role = "CUSTOMER" | "SELLER" | "ADMIN";

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

  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + (item.qty ?? 0), 0)
  );

  const [hidden, setHidden] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    // 1. Mobile-Open overrides all scroll-driven states
    if (isMobileOpen) {
      setHidden(false);
      setIsScrolled(latest > 10);
      return;
    }

    const previous = scrollY.getPrevious() ?? 0;
    const delta = latest - previous;

    // 2. Top implies exact origin (or near it)
    if (latest < 10) {
      setIsScrolled(false);
      setHidden(false);
      return;
    }

    setIsScrolled(true);

    // Keep it visible at the very top of scroll bounds to avoid jumping
    if (latest < 120) {
      setHidden(false);
      return;
    }

    // 3. Reappearing actively overrides Hidden based on explicit scroll deltas
    if (delta > 15) {
      setHidden(true); // Scrolling down, hide
    } else if (delta < -15) {
      setHidden(false); // Scrolling up, reappear
    }
  });

  const role = (user?.role ?? null) as Role | null;
  const isCustomer = role === "CUSTOMER";

  const dashboardHref =
    role === "ADMIN" ? "/admin" : role === "SELLER" ? "/seller/dashboard" : "/";

  const menuItems: { label: string; href: string; icon: React.ElementType }[] =
    !role
      ? []
      : role === "ADMIN" || role === "SELLER"
        ? [
            {
              label: "Dashboard",
              href: dashboardHref,
              icon: LayoutDashboard,
            },
          ]
        : [
            {
              label: "Profile",
              href: "/account/profile",
              icon: User2,
            },
            {
              label: "Orders",
              href: "/account/orders",
              icon: ShoppingCart,
            },
          ];

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      await refresh();
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Explicit placeholder bounded to exact height to obliterate CLS */}
      <div className="h-16 w-full shrink-0" aria-hidden="true" />

      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{
          duration: 0.35,
          ease: [0.16, 1, 0.3, 1], // Custom stable easing curve
        }}
        // Fallback constraint to ensure it's sticky if motion hooks ever fail locally
        style={{ position: 'fixed' }}
        className={cn(
          "inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-300",
          isScrolled || isMobileOpen
            ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-border/40 shadow-sm"
            : "bg-transparent border-b border-transparent",
          className
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all group-hover:shadow-md group-hover:border-primary/20">
              <Image
                src="/icons/logo.png"
                alt="MediStore"
                width={28}
                height={28}
                className="h-7 w-7 object-contain drop-shadow-sm"
                priority
              />
            </span>
            <span className="text-base font-semibold tracking-tight">
              <p>
                Medi<span className="text-primary transition-colors group-hover:brightness-110">Store</span>
              </p>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {menu.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.url}
                        className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-all hover:bg-primary/5 hover:text-primary"
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
          <div className="hidden items-center gap-3 lg:flex">
            {loading ? null : user && isCustomer ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                // Size-md utility control
                className="rounded-xl border-border/40 bg-background/50 h-10 px-4 backdrop-blur-sm hover:bg-primary/10 hover:text-primary transition-all relative overflow-visible shadow-none font-medium"
              >
                <Link href="/cart" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>
            ) : null}

            <ModeToggle />

            {loading ? null : user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-border/40 bg-background/50 h-10 gap-2 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/20 transition-all shadow-none"
                  >
                    <Avatar className="h-6 w-6 border border-border/50">
                      <AvatarImage src={user.image ?? undefined} />
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-[100px] truncate font-medium">
                      {user.name ?? "Account"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-premium border-border/40 glass-surface mt-2 z-60">
                  <DropdownMenuLabel className="space-y-1 p-2">
                    <p className="text-sm font-semibold leading-none text-foreground">
                      {user.name ?? "Account"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email ?? ""}
                    </p>
                    {role ? (
                      <p className="text-[11px] font-medium text-primary mt-1">
                        {role}
                      </p>
                    ) : null}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-border/50 my-1" />

                  {menuItems.map((item) => (
                    <DropdownMenuItem asChild key={item.href} className="rounded-lg cursor-pointer focus:bg-primary/5 focus:text-primary">
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 w-full p-2"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator className="bg-border/50 my-1" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-lg cursor-pointer flex items-center gap-2 p-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
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
                  className="rounded-xl border-border/40 bg-background/50 h-10 backdrop-blur-sm hover:bg-primary/10 hover:text-primary transition-all shadow-none"
                >
                  <Link href={auth.login.url}>{auth.login.title}</Link>
                </Button>
                <Button asChild size="sm" className="rounded-xl h-10 shadow-sm transition-transform hover:scale-105 hover:shadow-md active:scale-95 duration-200 bg-[#1292BD] hover:bg-[#0f7a9f] text-white hover:text-white">
                  <Link href={auth.signup.url}>{auth.signup.title}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            {loading ? null : user && isCustomer ? (
              <Button
                asChild
                variant="outline"
                size="icon"
                // Size-sm utility control
                className="rounded-xl border-border/40 bg-background/50 h-10 w-10 backdrop-blur-sm hover:bg-primary/10 hover:text-primary transition-all relative overflow-visible shadow-none"
              >
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Cart</span>
                  {cartCount > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
              </Button>
            ) : null}

            <ModeToggle />

            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl border-border/40 bg-background/50 h-10 w-10 backdrop-blur-sm hover:bg-primary/10 hover:text-primary transition-all shadow-none">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-full sm:w-[380px] p-0 border-l-border/40 glass-surface dark:bg-zinc-950/95 z-60 flex flex-col h-dvh">
                <SheetHeader className="p-6 border-b border-border/40 text-left pt-[calc(1.5rem+env(safe-area-inset-top))]">
                  <SheetTitle>
                    <Link href={logo.url} className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20">
                         <Image
                           width={24}
                           height={24}
                           src={logo.src}
                           alt={logo.alt}
                           className="h-6 w-6 object-contain drop-shadow-sm brightness-0 dark:brightness-100"
                         />
                      </span>
                      <span className="text-xl font-bold tracking-tight">
                        Medi<span className="text-primary">Store</span>
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 pb-[env(safe-area-inset-bottom)] scrollbar-hide">
                  <nav className="flex flex-col gap-2">
                    {menu.map((item) => (
                      <Link
                        key={item.title}
                        href={item.url}
                        onClick={() => setIsMobileOpen(false)}
                        className="rounded-xl px-4 py-4 text-base font-semibold text-foreground/80 transition-all hover:bg-primary/10 hover:text-primary hover:pl-6 border border-transparent hover:border-primary/10"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-8 pt-8 border-t border-border/40 flex flex-col gap-3">
                    {loading ? null : user ? (
                      <>
                        <div className="rounded-2xl border border-border/40 bg-card/40 dark:bg-black/20 p-4 mb-2 shadow-sm backdrop-blur-md">
                          <p className="truncate text-base font-semibold text-foreground">
                            {user.name ?? "Account"}
                          </p>
                          <p className="truncate text-sm text-muted-foreground mt-0.5">
                            {user.email ?? ""}
                          </p>
                          {role ? (
                            <span className="inline-flex mt-3 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary border border-primary/20">
                              {role}
                            </span>
                          ) : null}
                        </div>

                        {isCustomer ? (
                          <Button
                            asChild
                            variant="outline"
                            className="rounded-xl h-12 justify-start px-4 bg-background/50 backdrop-blur-sm border-border/40 hover:bg-primary/10 hover:text-primary transition-all text-base font-medium"
                          >
                            <Link href="/cart" onClick={() => setIsMobileOpen(false)}>
                              <ShoppingCart className="mr-3 h-5 w-5" />
                              Cart
                              {cartCount > 0 && (
                                <span className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground shadow-sm">
                                  {cartCount}
                                </span>
                              )}
                            </Link>
                          </Button>
                        ) : null}

                        {menuItems.map((item) => (
                          <Button
                            asChild
                            variant="outline"
                            key={item.href}
                            className="rounded-xl h-12 justify-start px-4 bg-background/50 backdrop-blur-sm border-border/40 hover:bg-primary/10 hover:text-primary transition-all text-base font-medium"
                          >
                            <Link href={item.href} onClick={() => setIsMobileOpen(false)}>
                              <item.icon className="mr-3 h-5 w-5" />
                              {item.label}
                            </Link>
                          </Button>
                        ))}

                        <Button
                          variant="outline"
                          onClick={() => {
                            handleLogout();
                            setIsMobileOpen(false);
                          }}
                          className="rounded-xl h-12 justify-start px-4 bg-background/50 backdrop-blur-sm border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all mt-2 text-base font-medium"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <Button asChild variant="outline" className="rounded-xl h-12 border-border/40 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:text-primary text-base font-medium">
                          <Link href={auth.login.url} onClick={() => setIsMobileOpen(false)}>
                            {auth.login.title}
                          </Link>
                        </Button>
                        <Button asChild className="rounded-xl h-12 shadow-md transition-transform active:scale-95 text-base font-medium bg-[#1292BD] hover:bg-[#0f7a9f] text-white hover:text-white">
                          <Link href={auth.signup.url} onClick={() => setIsMobileOpen(false)}>
                            {auth.signup.title}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>
    </>
  );
}
