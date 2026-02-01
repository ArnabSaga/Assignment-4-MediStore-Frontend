import { Suspense } from "react";

import { ShopHeader } from "./shop-header";
import { ShopFilters } from "./shop-filters";
import { MobileFilters } from "./mobile-filters";

import { ProductGridSkeleton } from "./product-grid-skeleton";

import type { ShopSearchParams } from "@/app/(public)/shop/page";
import { ProductGrid } from "./ProductGrid";

export function ShopPage({ searchParams }: { searchParams: ShopSearchParams }) {
  const category = searchParams.category;
  const q = searchParams.q;

  return (
    <main className="pb-14">
      <ShopHeader />

      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ShopFilters activeCategory={category} />
            </div>
          </aside>

          <section className="space-y-4">
            <div className="lg:hidden">
              <MobileFilters activeCategory={category} />
            </div>

            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid category={category} q={q} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
