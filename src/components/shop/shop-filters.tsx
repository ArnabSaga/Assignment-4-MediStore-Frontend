"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = [
  { label: "Vitamins", value: "vitamin" },
  { label: "Antibiotic", value: "antibiotic" },
  { label: "Skin Care", value: "skin-care" },
  { label: "Diabetes", value: "diabetes" },
  { label: "Allergy", value: "allergy" },
];

function withCategory(sp: URLSearchParams, category?: string) {
  const next = new URLSearchParams(sp.toString());
  if (!category) next.delete("category");
  else next.set("category", category);
  next.delete("page");
  return next.toString();
}

export function ShopFilters({ activeCategory }: { activeCategory?: string }) {
  const sp = useSearchParams();

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <p className="text-sm font-semibold">Categories</p>
        <Separator className="my-4" />

        <div className="space-y-1">
          <Link
            href={`/shop${withCategory(sp, undefined) ? `?${withCategory(sp, undefined)}` : ""}`}
            className={cn(
              "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
              !activeCategory && "bg-muted font-medium"
            )}
          >
            All
          </Link>

          {CATEGORIES.map((c) => {
            const isActive = activeCategory === c.value;
            const qs = withCategory(sp, c.value);
            return (
              <Link
                key={c.value}
                href={`/shop?${qs}`}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                  isActive && "bg-muted font-medium"
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
