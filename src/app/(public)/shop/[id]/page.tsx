import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { serverApi } from "@/lib/server-api";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { PRODUCT_IMAGE_MAP } from "@/lib/product-images";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Medicine = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  manufacturer?: string | null;
  imageUrl?: string | null;
  category?: Category | null;
};

function resolveImage(m: Medicine) {
  return (
    (m.imageUrl && m.imageUrl.trim() ? m.imageUrl : null) ??
    PRODUCT_IMAGE_MAP[m.slug] ??
    "/images/placeholder.png"
  );
}

async function getMedicine(id: string): Promise<Medicine | null> {
  try {
    return await serverApi<Medicine>(`/medicines/${id}`, { cache: "no-store" });
  } catch {
    return null;
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getMedicine(id);
  if (!product) notFound();

  return (
    <main className="pb-14">
      <div className="mx-auto max-w-6xl px-4">
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
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={resolveImage(product)}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {product.category?.slug ? (
              <Badge variant="secondary" className="w-fit capitalize">
                {product.category.slug}
              </Badge>
            ) : null}

            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold">
                ৳{Number(product.price)}
              </span>
            </div>

            <Separator />

            <p className="text-sm leading-6 text-muted-foreground">
              {product.description ?? "No description available."}
            </p>

            <div className="pt-4">
              <AddToCartButton
                id={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                manufacturer={product.manufacturer ?? undefined}
                imageUrl={resolveImage(product)}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
