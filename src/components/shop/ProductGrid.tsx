import { PRODUCT_IMAGE_MAP } from "@/lib/product-images";
import { serverApi } from "@/lib/server-api";
import { ProductCard } from "./product-card";
import Link from "next/link";

import type { ShopSearchParams } from "@/app/(public)/shop/page";
import type { Category, Medicine } from "@/types/api";

async function getCategoryIdFromSlug(slug?: string) {
  if (!slug) return undefined;

  const categories = await serverApi<Category[]>("/categories?limit=100", {
    cache: "no-store",
  });

  const match = categories.find((c) => c.slug === slug);
  return match?.id;
}

async function getMedicines(categorySlug?: string, q?: string, page: number = 1) {
  const params = new URLSearchParams();

  // Limit 6 + 1 to check if there is a next page
  const limit = 6;
  params.set("limit", (limit + 1).toString());
  params.set("page", page.toString());

  if (q) params.set("search", q);

  const categoryId = await getCategoryIdFromSlug(categorySlug);
  if (categoryId) params.set("categoryId", categoryId);

  const qs = params.toString();
  const path = qs ? `/medicines?${qs}` : "/medicines";

  return serverApi<Medicine[]>(path, { cache: "no-store" });
}

function resolveImage(m: Medicine) {
  return (
    (m.imageUrl && m.imageUrl.trim() ? m.imageUrl : null) ??
    PRODUCT_IMAGE_MAP[m.slug!] ??
    "/images/placeholder.png"
  );
}

export async function ProductGrid({
  category,
  q,
  page,
  searchParams,
}: {
  category?: string;
  q?: string;
  page: number;
  searchParams: ShopSearchParams;
}) {
  const allItems = await getMedicines(category, q, page);
  const items = allItems.slice(0, 6);
  const hasNextPage = allItems.length > 6;

  if (items.length === 0) {
    return (
      <div className="shop-empty">
        <div className="mx-auto max-w-md">
          <p className="text-lg font-semibold tracking-tight">No products found</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Try a different keyword or switch to another category to explore more medicines and
            healthcare essentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-3 rounded-[1.25rem] border border-border/70 bg-card/55 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">
            {items.length} product{items.length > 1 ? "s" : ""} available
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="shop-chip shop-chip-active">Verified catalog</span>
          <span className="shop-chip">Responsive grid</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {items.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              name: p.name,
              price: Number(p.price),
              image: resolveImage(p),
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link
          href={{
            pathname: "/shop",
            query: { ...searchParams, page: page - 1 },
          }}
          className={`btn-outline rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all ${
            page <= 1 ? "pointer-events-none opacity-40 grayscale" : "hover:scale-[1.02]"
          }`}
          aria-disabled={page <= 1}
        >
          Previous
        </Link>

        <span className="text-sm font-medium text-muted-foreground">
          Page <span className="text-foreground">{page}</span>
        </span>

        <Link
          href={{
            pathname: "/shop",
            query: { ...searchParams, page: page + 1 },
          }}
          className={`btn-outline rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all ${
            !hasNextPage ? "pointer-events-none opacity-40 grayscale" : "hover:scale-[1.02]"
          }`}
          aria-disabled={!hasNextPage}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
