import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import type { DashboardShellProps } from "./dashboard-types";

export function DashboardShell({
  children,
  user,
  label,
  navigation,
  onLogout,
}: DashboardShellProps) {
  return (
    <div className="dashboard-canvas min-h-dvh bg-background text-foreground lg:h-dvh lg:overflow-hidden">
      <div className="lg:flex lg:h-full lg:min-h-0">
        <DashboardSidebar
          label={label}
          user={user}
          navigation={navigation}
          onLogout={onLogout}
        />
        <div className="min-w-0 flex-1 lg:flex lg:min-h-0 lg:flex-col">
          <DashboardTopbar
            label={label}
            user={user}
            navigation={navigation}
            onLogout={onLogout}
          />
          <main className="min-w-0 px-4 py-5 sm:px-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-8 lg:py-6">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
