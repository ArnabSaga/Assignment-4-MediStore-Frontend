import { Suspense } from "react";

import { ShopHeader } from "./shop-header";
import { ShopFilters } from "./shop-filters";
import { MobileFilters } from "./mobile-filters";

import { ProductGridSkeleton } from "./product-grid-skeleton";

import type { ShopSearchParams } from "@/app/(public)/shop/page";
import { ProductGrid } from './ProductGrid';

export function ShopPage({ searchParams }: { searchParams: ShopSearchParams }) {
  const category = searchParams.category;
  const q = searchParams.q;

  return (
    <main className="pb-14">
      {/* Client header (handles URL search q) */}
      <ShopHeader />

      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ShopFilters activeCategory={category} />
            </div>
          </aside>

          {/* Content */}
          <section className="space-y-4">
            {/* Mobile filters */}
            <div className="lg:hidden">
              <MobileFilters activeCategory={category} />
            </div>

            {/* Products */}
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid category={category} q={q} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
