"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { clientApi } from "@/lib/client-api";

type Category = {
  id: string;
  name: string;
  slug: string;
};

function withCategory(sp: URLSearchParams, category?: string) {
  const next = new URLSearchParams(sp.toString());
  if (!category) next.delete("category");
  else next.set("category", category);
  next.delete("page");
  return next.toString();
}

export function ShopFilters({ activeCategory }: { activeCategory?: string }) {
  const sp = useSearchParams();
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    clientApi<Category[]>("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <p className="text-sm font-semibold">Categories</p>
        <Separator className="my-4" />

        <div className="space-y-1">
          <Link
            href={`/shop${withCategory(sp) ? `?${withCategory(sp)}` : ""}`}
            className={cn(
              "block rounded-md px-3 py-2 text-sm hover:bg-muted",
              !activeCategory && "bg-muted font-medium"
            )}
          >
            All
          </Link>

          {categories.map((c) => {
            const isActive = activeCategory === c.slug;
            const qs = withCategory(sp, c.slug);

            return (
              <Link
                key={c.id}
                href={`/shop?${qs}`}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm hover:bg-muted",
                  isActive && "bg-muted font-medium"
                )}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
