import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  image: string;
  description: string;
};

// 🔁 Replace with real API later
async function getProduct(id: string): Promise<Product | null> {
  await new Promise((r) => setTimeout(r, 400));

  const products: Product[] = [
    {
      id: "1",
      name: "Vitamin C 500mg",
      category: "vitamin",
      price: 500,
      salePrice: 400,
      image: "/images/products/vitamin-c.jpg",
      description:
        "Vitamin C supports immunity, skin health, and antioxidant protection. Suitable for daily use.",
    },
    {
      id: "2",
      name: "Cef-3 DS",
      category: "antibiotic",
      price: 450,
      image: "/images/products/cef-3.jpg",
      description:
        "Broad spectrum antibiotic used for bacterial infections. Use as directed by a physician.",
    },
  ];

  return products.find((p) => p.id === id) ?? null;
}

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) notFound();

  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <main className="pb-14">
      <div className="mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <div className="py-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/shop" className="hover:underline">
            Shop
          </Link>{" "}
          / <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit capitalize">
              {product.category}
            </Badge>

            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-semibold">
                    ৳{product.salePrice}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ৳{product.price}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-semibold">৳{product.price}</span>
              )}
            </div>

            <Separator />

            {/* Description */}
            <p className="text-sm leading-6 text-muted-foreground">
              {product.description}
            </p>

            {/* CTA */}
            <div className="pt-4">
              <Button size="lg" className="w-full sm:w-auto">
                Add to Cart
              </Button>
            </div>

            {/* Safety note */}
            <p className="pt-2 text-xs text-muted-foreground">
              ⚠️ This is an over-the-counter medicine. Read label instructions
              carefully. Consult a healthcare professional if needed.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
