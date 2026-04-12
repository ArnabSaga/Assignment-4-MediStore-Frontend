import { Suspense } from "react";

import { MobileFilters } from "./mobile-filters";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { ShopFilters } from "./shop-filters";
import { ShopHeader } from "./shop-header";

import type { ShopSearchParams } from "@/app/(public)/shop/page";
import { ProductGrid } from "./ProductGrid";

export function ShopPage({ searchParams }: { searchParams: ShopSearchParams }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const category = searchParams.category;
  const q = searchParams.q;

  return (
    <main className="shop-shell pb-14 md:pb-20">
      <ShopHeader />

      <div className="container-custom relative z-10 mt-6 md:mt-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden xl:block">
            <div className="shop-sticky-offset sticky">
              <ShopFilters activeCategory={category} />
            </div>
          </aside>

          <section className="min-w-0 space-y-4 md:space-y-5">
            <div className="xl:hidden">
              <MobileFilters activeCategory={category} />
            </div>

            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid category={category} q={q} page={page} searchParams={searchParams} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
