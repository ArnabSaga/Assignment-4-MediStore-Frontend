"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import type { DashboardNavItem } from "./dashboard-types";

type DashboardNavLinksProps = {
  items: DashboardNavItem[];
  onNavigate?: () => void;
};

export function DashboardNavLinks({ items, onNavigate }: DashboardNavLinksProps) {
  const pathname = usePathname() || "/";

  return (
    <nav aria-label="Dashboard navigation" className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
              active
                ? "bg-dashboard-sidebar-active text-neutral-950 shadow-sm"
                : "text-dashboard-sidebar-foreground/60 hover:bg-dashboard-sidebar-foreground/10 hover:text-dashboard-sidebar-foreground"
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
