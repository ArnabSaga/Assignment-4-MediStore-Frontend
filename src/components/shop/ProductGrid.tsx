import { serverApi } from "@/lib/server-api";
import { ProductCard } from "./product-card";
import { PRODUCT_IMAGE_MAP } from "@/lib/product-images";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Medicine = {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  imageUrl?: string | null;
  category?: Category | null;
};

async function getCategoryIdFromSlug(slug?: string) {
  if (!slug) return undefined;

  const categories = await serverApi<Category[]>("/categories", {
    cache: "no-store",
  });

  const match = categories.find((c) => c.slug === slug);
  return match?.id;
}

async function getMedicines(categorySlug?: string, q?: string) {
  const params = new URLSearchParams();

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
    PRODUCT_IMAGE_MAP[m.slug] ??
    "/images/placeholder.png"
  );
}

export async function ProductGrid({
  category,
  q,
}: {
  category?: string;
  q?: string;
}) {
  const items = await getMedicines(category, q);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No products found. Try changing filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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

      <div className="mt-8 flex justify-center">
        <button className="rounded-md border px-6 py-2 text-sm hover:bg-muted">
          Load more
        </button>
      </div>
    </>
  );
}
