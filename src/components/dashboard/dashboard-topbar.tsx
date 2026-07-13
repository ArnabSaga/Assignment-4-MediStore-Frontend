import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/ModeToggle";

import { DashboardMobileNav } from "./dashboard-mobile-nav";
import type { DashboardNavItem, DashboardUser } from "./dashboard-types";

type DashboardTopbarProps = {
  label: string;
  user: DashboardUser;
  navigation: DashboardNavItem[];
  onLogout: () => void;
};

export function DashboardTopbar({
  label,
  user,
  navigation,
  onLogout,
}: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/88 backdrop-blur-xl lg:static lg:bg-transparent">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <DashboardMobileNav label={label} navigation={navigation} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold lg:hidden">{label}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.name} - {user.role}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ModeToggle />
          <Button asChild variant="outline" size="sm" className="hidden sm:flex">
            <Link href="/account/profile">
              <UserRound aria-hidden="true" className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => void onLogout()}
            aria-label="Log out"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
