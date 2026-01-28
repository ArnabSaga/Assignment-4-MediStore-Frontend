"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

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

      // Always show near top
      if (y < HIDE_AFTER) {
        setHidden(false);
        lastY.current = y;
        ticking.current = false;
        return;
      }

      // Ignore tiny movements
      if (Math.abs(delta) < THRESHOLD) {
        ticking.current = false;
        return;
      }

      // Hide on scroll down, show on scroll up
      if (delta > 0) setHidden(true);
      else setHidden(false);

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

  return (
    <>
      {/* Spacer so fixed header doesn't cover content */}
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
          <Link href={logo.url} className="flex items-center gap-2">
            <Image
              width={28}
              height={28}
              src={logo.src}
              alt={logo.alt}
              className={cn("h-16 w-16 ", logo.className)}
              priority
            />
            <span className="text-base font-semibold tracking-tight">
              {/* {logo.title} */}
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
            <Button asChild variant="outline" size="sm" className="btn-outline">
              <Link href={auth.login.url}>{auth.login.title}</Link>
            </Button>
            <Button asChild size="sm" className="btn-primary">
              <Link href={auth.signup.url}>{auth.signup.title}</Link>
            </Button>
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
                  <Button asChild variant="outline" className="btn-outline">
                    <Link href={auth.login.url}>{auth.login.title}</Link>
                  </Button>
                  <Button asChild className="btn-primary">
                    <Link href={auth.signup.url}>{auth.signup.title}</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
