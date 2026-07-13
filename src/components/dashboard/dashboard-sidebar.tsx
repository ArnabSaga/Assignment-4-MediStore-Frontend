import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DashboardNavLinks } from "./dashboard-nav-links";
import type { DashboardNavItem, DashboardUser } from "./dashboard-types";

type DashboardSidebarProps = {
  label: string;
  user: DashboardUser;
  navigation: DashboardNavItem[];
  onLogout: () => void;
};

export function DashboardSidebar({
  label,
  user,
  navigation,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <aside className="hidden h-dvh w-68 shrink-0 bg-dashboard-sidebar text-dashboard-sidebar-foreground lg:flex">
      <div className="flex min-h-0 w-full flex-col border-r border-dashboard-sidebar-border p-4">
        <div className="flex items-center gap-3 px-1 py-2">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-dashboard-sidebar-border bg-dashboard-sidebar-foreground/8">
            <Image
              src="/icons/logo.png"
              alt="MediStore"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight">MediStore</p>
            <p className="text-xs text-dashboard-sidebar-muted">{label}</p>
          </div>
        </div>

        <div className="mt-7 min-h-0 flex-1 overflow-y-auto pr-1">
          <DashboardNavLinks items={navigation} />
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border border-dashboard-sidebar-border bg-dashboard-sidebar-foreground/8 p-3">
          <p className="text-xs font-medium text-dashboard-sidebar-muted">
            Signed in
          </p>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-dashboard-sidebar-muted">
              {user.email}
            </p>
          </div>
          <div className="grid gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-dashboard-sidebar-border bg-dashboard-sidebar-foreground/8 text-dashboard-sidebar-foreground hover:bg-dashboard-sidebar-foreground/14"
            >
              <Link href="/">
                <ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />
                View site
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-dashboard-sidebar-border bg-transparent text-dashboard-sidebar-foreground hover:bg-dashboard-sidebar-foreground/10"
              onClick={() => void onLogout()}
            >
              <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
