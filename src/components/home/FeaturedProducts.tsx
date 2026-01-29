import Link from "next/link";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeaturedProduct = {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  image: string; 
  href: string; 
};

const products: FeaturedProduct[] = [
  {
    id: "p1",
    name: "Cef-3",
    subtitle: "900g",
    price: 150.0,
    image: "/images/products/antibiotic-cef-3.webp",
    href: "/shop/p1",
  },
  {
    id: "p2",
    name: "Fexo 180mg",
    subtitle: "10 tablets",
    price: 120.0,
    image: "/images/products/allergy-fexo.webp",
    href: "/shop/p2",
  },
  {
    id: "p3",
    name: "Saffola Oil",
    subtitle: "5 liter",
    price: 1200,
    image: "/images/products/saffola.webp",
    href: "/shop/p3",
  },
  {
    id: "p4",
    name: "Napa 500mg",
    subtitle: "12 tablets",
    price: 25,
    image: "/images/products/pain-fever-napa.webp",
    href: "/shop/p4",
  },
  {
    id: "p5",
    name: "Becosules",
    subtitle: "9 tablets",
    price: 190,
    image: "/images/products/vitamin-becosules.webp",
    href: "/shop/p5",
  },
  {
    id: "p6",
    name: "Napa liquid",
    subtitle: "250 ml",
    price: 70,
    image: "/images/products/pain-fever-napa-liquid.webp",
    href: "/shop/p6",
  },
  {
    id: "p7",
    name: "Januvia",
    subtitle: "10 capsules",
    price: 130,
    image: "/images/products/diabetes-januvia.webp",
    href: "/shop/p7",
  },
  {
    id: "p8",
    name: "Combo Set",
    subtitle: "5 Porducts",
    price: 1600,
    image: "/images/products/skin-care-medicine.webp",
    href: "/shop/p8",
  },
];

function formatPrice(n: number) {
  return `BDT ${n.toFixed(2)}`;
}

export function FeaturedProducts({
  className,
  label = "Products",
  heading = "Featured Products",
  viewAllHref = "/shop",
}: {
  className?: string;
  label?: string;
  heading?: string;
  viewAllHref?: string;
}) {
  return (
    <section
      className={cn("py-10 md:py-14 bg-zinc-100 dark:bg-zinc-900", className)}
      aria-labelledby="featured-products"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <h2
              id="featured-products"
              className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl"
            >
              {heading}
            </h2>
          </div>

          <Link
            href={viewAllHref}
            className="link-hover hidden text-sm text-muted-foreground sm:inline-flex"
          >
            View all
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden border-border bg-card text-card-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <CardContent className="p-4">
                {/* Image */}
                <Link href={p.href} className="group block">
                  <div className="relative h-36 w-full overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  </div>

                  {/* Name */}
                  <div className="mt-3 space-y-1">
                    <p className="line-clamp-1 text-sm font-semibold">
                      {p.name}
                    </p>
                    {p.subtitle ? (
                      <p className="text-xs text-muted-foreground">
                        {p.subtitle}
                      </p>
                    ) : null}
                  </div>
                </Link>

                {/* Price + CTA */}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {formatPrice(p.price)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="btn-outline h-9 rounded-full px-3"
                  >
                    Add to cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="btn-outline rounded-full px-6"
          >
            <Link href={viewAllHref}>Get more</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
