"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function buildQueryString(
  current: URLSearchParams,
  updates: Record<string, string | null | undefined>
) {
  const sp = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") sp.delete(key);
    else sp.set(key, value);
  }

  if ("q" in updates || "category" in updates || "sort" in updates) {
    sp.delete("page");
  }

  return sp.toString();
}

export function ShopHeader({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? undefined;
  const qFromUrl = searchParams.get("q") ?? "";

  const [q, setQ] = React.useState(qFromUrl);

  React.useEffect(() => {
    setQ(qFromUrl);
  }, [qFromUrl]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const next = buildQueryString(searchParams, { q });
      router.replace(next ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    }, 350);

    return () => clearTimeout(t);
  }, [q]);

  return (
    <section className={cn("border-b border-border bg-background", className)}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="link-hover">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Shop</span>
          {category ? (
            <>
              <span>/</span>
              <span className="text-foreground">{category}</span>
            </>
          ) : null}
        </div>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Explore All Products
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {category ? (
                <>
                  Filtering by category:{" "}
                  <span className="text-foreground">{category}</span>
                </>
              ) : (
                "Browse medicines, filter by category, and find OTC products fast."
              )}
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
              placeholder="Search medicines..."
              aria-label="Search medicines"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
