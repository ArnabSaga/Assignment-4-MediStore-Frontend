import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardPanelProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardPanel({ children, className }: DashboardPanelProps) {
  return (
    <section className={cn("dashboard-panel p-4 sm:p-5", className)}>
      {children}
    </section>
  );
}
