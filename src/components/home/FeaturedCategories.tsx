"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

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
    description: "Daily essentials for immunity, energy, and wellness—delivered fast.",
    href: "/shop?category=vitamin",
    image: "/images/promos/promo-vitamins.jpg",
  },
  {
    badge: "Doctor-trusted OTC",
    title: "Cold, Allergy & Fever",
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
    <section className={cn("py-12 md:py-20", className)} aria-labelledby="featured-categories">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 id="featured-categories" className="text-3xl font-bold tracking-tight md:text-4xl text-pretty">
              {heading}
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              Browse popular healthcare categories and start shopping.
            </p>
          </motion.div>

          <Link
            href="/shop"
            className="group hidden items-center gap-2 text-sm font-semibold text-primary sm:inline-flex"
          >
            View all <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className="group block h-full"
              >
                <Card className="h-full overflow-hidden border-border/50 bg-card/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-premium hover:bg-card">
                  <CardContent className="p-0">
                    <div className="relative aspect-3/2 w-full bg-muted overflow-hidden">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="p-4 text-center">
                      <p className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                        {cat.title}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-primary/70 transition-colors">
                        Shop Now
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 sm:hidden">
          <Link
            href="/shop"
            className="flex h-12 w-full items-center justify-center rounded-full border border-border bg-card text-sm font-semibold transition-colors active:bg-accent"
          >
            View all categories <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Promos Section */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:mt-16">
          {promos.map((p, index) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={p.href} className="group relative block overflow-hidden rounded-(--radius-l)">
                <div className="relative h-64 md:h-72 lg:h-80 w-full overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Premium Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent dark:from-black/90 dark:via-black/50 overflow-hidden" />

                  {/* Content Over Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
                    <div className="max-w-xs md:max-w-md">
                      <span className="inline-flex rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                        {p.badge}
                      </span>

                      <h3 className="mt-5 text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl text-pretty">
                        {p.title}
                      </h3>

                      <p className="mt-3 text-sm font-medium text-white/80 md:text-base line-clamp-2">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-6">
                      <span className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-black transition-transform group-hover:scale-105 active:scale-95 shadow-lg">
                        Shop Collection <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
