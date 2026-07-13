import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import type { DashboardBreadcrumb } from "./dashboard-types";

type DashboardPageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: DashboardBreadcrumb[];
  actions?: ReactNode;
};

export function DashboardPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 space-y-2">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
            {breadcrumbs.map((item, index) => {
              const last = index === breadcrumbs.length - 1;
              return (
                <span key={`${item.label}-${index}`} className="flex items-center gap-1">
                  {item.href && !last ? (
                    <Link className="hover:text-foreground" href={item.href}>
                      {item.label}
                    </Link>
                  ) : (
                    <span className={last ? "text-foreground" : undefined}>
                      {item.label}
                    </span>
                  )}
                  {!last ? <ChevronRight aria-hidden="true" className="h-3 w-3" /> : null}
                </span>
              );
            })}
          </nav>
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
