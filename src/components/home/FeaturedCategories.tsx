import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Category = {
  title: string;
  slug: string;
  image?: string;
};

type Promo = {
  badge: string;
  title: string;
  description: string;
  href: string;
  image: string;
};

const categories: Category[] = [
  {
    title: "Vitamin",
    slug: "vitamin",
    image: "/images/categories/vitamin-becosules.webp",
  },
  {
    title: "Antibiotic",
    slug: "antibiotic",
    image: "/images/categories/antibiotic-cef-3.webp",
  },
  {
    title: "Skin Care",
    slug: "skin-care",
    image: "/images/categories/skin-care-medicine.webp",
  },
  {
    title: "Diabetes",
    slug: "diabetes",
    image: "/images/categories/diabetes-januvia.webp",
  },
  {
    title: "Allergy",
    slug: "allergy",
    image: "/images/categories/allergy-fexo.webp",
  },
];

const promos: Promo[] = [
  {
    badge: "Up to 20% OFF",
    title: "Vitamins & Supplements",
    description:
      "Daily essentials for immunity, energy, and wellness—delivered fast.",
    href: "/shop?category=vitamin",
    image: "/images/promos/promo-vitamins.jpg",
  },
  {
    badge: "Doctor-trusted OTC",
    title: "Cold, Allergy & Fever Care",
    description: "Relief for seasonal allergies, cough, and fever—shop safely.",
    href: "/shop?category=allergy",
    image: "/images/promos/promo-cold-allergy.jpg",
  },
];

export function FeaturedCategories({
  className,
  heading = "Featured Categories",
}: {
  className?: string;
  heading?: string;
}) {
  return (
    <section
      className={cn("py-10 md:py-14", className)}
      aria-labelledby="featured-categories"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2
              id="featured-categories"
              className="text-2xl font-semibold tracking-tight md:text-3xl"
            >
              {heading}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse popular medicine categories and start shopping.
            </p>
          </div>

          <Link
            href="/shop"
            className="link-hover hidden items-center gap-1 text-sm text-muted-foreground sm:inline-flex"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Categories */}
        <div
          className="
            flex gap-4 overflow-x-auto pb-2
            snap-x snap-mandatory
            [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0 sm:snap-none
            lg:grid-cols-5
          "
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="group snap-start"
            >
              <Card
                className="
                  w-55 overflow-hidden border-border bg-card text-card-foreground
                  transition-all duration-300 hover:-translate-y-1 hover:shadow-md
                  sm:w-auto
                "
              >
                <CardContent className="p-0">
                  <div className="relative h-40 w-full bg-muted sm:h-44 lg:h-48">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.title}
                        fill
                        sizes="(max-width: 640px) 220px, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
                      />
                    ) : null}
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/40" />
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-semibold">{cat.title}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Shop now
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Mobile "View all" */}
        <div className="mt-6 sm:hidden">
          <Link
            href="/shop"
            className="btn-outline inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm"
          >
            View all categories <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Promos */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {promos.map((p) => (
            <Link key={p.title} href={p.href} className="group">
              <Card className="overflow-hidden border-border bg-card text-card-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-0">
                  <div className="relative h-55 w-full overflow-hidden md:h-65">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      priority={false}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/80 to-background/25 dark:from-background/95 dark:via-background/85 dark:to-background/30" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
                      <div>
                        <span className="inline-flex w-fit rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                          {p.badge}
                        </span>

                        <h3 className="mt-4 max-w-md text-2xl font-semibold tracking-tight md:text-3xl">
                          {p.title}
                        </h3>

                        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                          {p.description}
                        </p>
                      </div>

                      <div>
                        <span className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm">
                          Shop Now <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
