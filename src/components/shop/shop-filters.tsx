"use client";

import { motion } from "framer-motion";
import { ChevronRight, Pill } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";

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
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className="shop-panel shop-soft-border overflow-hidden">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Pill className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Categories</p>
              <p className="text-xs text-muted-foreground">Filter by therapeutic group</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-1.5">
            <Link
              href={`/shop${withCategory(sp) ? `?${withCategory(sp)}` : ""}`}
              className={cn("shop-filter-link", !activeCategory && "shop-filter-link-active")}
            >
              <span>All Products</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  !activeCategory && "translate-x-0.5 text-primary"
                )}
              />
            </Link>

            {categories.map((c, index) => {
              const isActive = activeCategory === c.slug;
              const qs = withCategory(sp, c.slug);

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: Math.min(index * 0.03, 0.18) }}
                >
                  <Link
                    href={`/shop?${qs}`}
                    className={cn("shop-filter-link", isActive && "shop-filter-link-active")}
                  >
                    <span className="truncate">{c.name}</span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-all duration-200",
                        isActive ? "translate-x-0.5 text-primary" : "group-hover:translate-x-0.5"
                      )}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
