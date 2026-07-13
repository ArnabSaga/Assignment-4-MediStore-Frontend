import type { ElementType, ReactNode } from "react";
import { MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  title: string;
  value: ReactNode;
  helper?: ReactNode;
  icon?: ElementType;
  tone?: "default" | "accent" | "warning" | "danger";
};

export function DashboardStatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: DashboardStatCardProps) {
  return (
    <article
      className={cn(
        "dashboard-panel min-w-0 p-4",
        tone === "accent" &&
          "bg-dashboard-sidebar text-dashboard-sidebar-foreground",
        tone === "warning" && "border-button-primary/30",
        tone === "danger" && "border-destructive/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "grid h-10 w-10 place-items-center rounded-xl bg-muted text-foreground",
            tone === "accent" &&
              "bg-dashboard-sidebar-active text-neutral-900"
          )}
        >
          {Icon ? <Icon aria-hidden="true" className="h-4 w-4" /> : null}
        </div>
        <MoreVertical
          aria-hidden="true"
          className={cn(
            "h-4 w-4 text-muted-foreground",
            tone === "accent" && "text-dashboard-sidebar-muted"
          )}
        />
      </div>
      <div className="mt-4 min-w-0">
        <p
          className={cn(
            "text-sm text-muted-foreground",
            tone === "accent" && "text-dashboard-sidebar-muted"
          )}
        >
          {title}
        </p>
        <div className="mt-1 text-2xl font-semibold tracking-tight">
          {value}
        </div>
        {helper ? (
          <div
            className={cn(
              "mt-1 text-xs text-muted-foreground",
              tone === "accent" && "text-dashboard-sidebar-muted"
            )}
          >
            {helper}
          </div>
        ) : null}
      </div>
    </article>
  );
}
