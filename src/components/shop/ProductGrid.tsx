
import { ProductCard } from './product-card';

type Product = {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  category: string;
};

async function getProducts(category?: string, q?: string): Promise<Product[]> {
  // 🔁 Replace with real API later
  await new Promise((r) => setTimeout(r, 600)); // demo delay

  return [
    {
      id: "1",
      name: "Vitamin C 500mg",
      price: 500,
      salePrice: 400,
      image: "/images/products/vitamin-becosules.webp",
      category: "vitamin",
    },
    {
      id: "2",
      name: "Cef-3 DS",
      price: 450,
      image: "/images/products/antibiotic-cef-3.webp",
      category: "antibiotic",
    },
    {
      id: "3",
      name: "Fexo 180",
      price: 350,
      salePrice: 299,
      image: "/images/products/allergy-fexo.webp",
      category: "allergy",
    },
  ].filter((p) => {
    if (category && p.category !== category) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
}

export async function ProductGrid({
  category,
  q,
}: {
  category?: string;
  q?: string;
}) {
  const products = await getProducts(category, q);

  if (!products.length) {
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
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Load more (UI-only for now) */}
      <div className="mt-8 flex justify-center">
        <button className="rounded-md border px-6 py-2 text-sm hover:bg-muted">
          Load more
        </button>
      </div>
    </>
  );
}
