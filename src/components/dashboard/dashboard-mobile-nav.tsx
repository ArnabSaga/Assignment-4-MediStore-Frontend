"use client";

import * as React from "react";
import Image from "next/image";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { DashboardNavLinks } from "./dashboard-nav-links";
import type { DashboardNavItem } from "./dashboard-types";

type DashboardMobileNavProps = {
  label: string;
  navigation: DashboardNavItem[];
};

export function DashboardMobileNav({
  label,
  navigation,
}: DashboardMobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 lg:hidden"
          aria-label="Open dashboard navigation"
        >
          <Menu aria-hidden="true" className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-80 border-dashboard-sidebar-border bg-dashboard-sidebar p-0 text-dashboard-sidebar-foreground"
      >
        <SheetHeader className="border-b border-dashboard-sidebar-border p-4 text-left">
          <SheetTitle className="flex items-center gap-3 text-dashboard-sidebar-foreground">
            <Image
              src="/icons/logo.png"
              alt="MediStore"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span>
              <span className="block text-base">MediStore</span>
              <span className="block text-xs font-normal text-dashboard-sidebar-muted">
                {label}
              </span>
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100dvh-73px)] overflow-y-auto p-4">
          <DashboardNavLinks
            items={navigation}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
