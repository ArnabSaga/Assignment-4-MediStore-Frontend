"use client";

import { motion } from "framer-motion";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    name: "Cef-3 Antibiotic",
    subtitle: "900g Powder for Suspension",
    price: 150.0,
    image: "/images/medicines/cef-3.webp",
    href: "/shop/p1",
  },
  {
    id: "p2",
    name: "Fexo 180mg",
    subtitle: "10 Tablets / Strip",
    price: 120.0,
    image: "/images/medicines/fexo.webp",
    href: "/shop/p2",
  },
  {
    id: "p3",
    name: "Saffola Gold Oil",
    subtitle: "5 Liters Enriched Oil",
    price: 1200,
    image: "/images/medicines/saffola.webp",
    href: "/shop/p3",
  },
  {
    id: "p4",
    name: "Napa 500mg",
    subtitle: "12 Tablets Paracetamol",
    price: 25,
    image: "/images/medicines/pain-fever-napa.webp",
    href: "/shop/p4",
  },
  {
    id: "p5",
    name: "Becosules Vitamin",
    subtitle: "9 Capsules B-Complex",
    price: 190,
    image: "/images/medicines/vitamin-becosules.webp",
    href: "/shop/p5",
  },
  {
    id: "p6",
    name: "Napa Pediatric Liquid",
    subtitle: "250 ml Strawberry Flavor",
    price: 70,
    image: "/images/medicines/pain-fever-napa-liquid.webp",
    href: "/shop/p6",
  },
  {
    id: "p7",
    name: "Januvia 100mg",
    subtitle: "10 Capsules / Strip",
    price: 130,
    image: "/images/medicines/diabetes-januvia.webp",
    href: "/shop/p7",
  },
  {
    id: "p8",
    name: "Premium Skin Care",
    subtitle: "5 Products Combo Set",
    price: 1600,
    image: "/images/medicines/skin-care-medicine.webp",
    href: "/shop/p8",
  },
];

function formatPrice(n: number) {
  return `BDT ${n.toLocaleString()}`;
}

export function FeaturedProducts({
  className,
  label = "Best Sellers",
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
      className={cn("py-12 md:py-20 bg-zinc-50/50 dark:bg-zinc-950/20", className)}
      aria-labelledby="featured-products"
    >
      <div className="container-custom">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{label}</p>
            <h2 id="featured-products" className="text-3xl font-bold tracking-tight md:text-4xl">
              {heading}
            </h2>
          </motion.div>

          <Link
            href={viewAllHref}
            className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            View all <span className="hidden sm:inline">products</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (index % 4) * 0.1 }}
            >
              <Card className="group h-full overflow-hidden border-border/40 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-premium">
                <CardContent className="p-0">
                  {/* Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Action Overlays (Desktop Only) */}
                    <div className="absolute inset-0 bg-black/5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex">
                      <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-10 w-10 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-10 w-10 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-primary/95 px-2.5 py-1 text-[10px] font-bold text-white dark:text-black shadow-lg backdrop-blur-sm">
                        Premium
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 md:p-5">
                    <div className="mb-4 h-12">
                      <Link href={p.href} className="block group/link">
                        <h3 className="line-clamp-2 text-sm font-bold tracking-tight group-hover/link:text-primary transition-colors">
                          {p.name}
                        </h3>
                        {p.subtitle && (
                          <p className="mt-1 line-clamp-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                            {p.subtitle}
                          </p>
                        )}
                      </Link>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground leading-tight tracking-wider">
                          Price
                        </span>
                        <p className="text-base font-bold text-foreground">
                          {formatPrice(p.price)}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        className="h-9 w-9 p-0 rounded-full bg-zinc-100 text-zinc-900 hover:bg-primary hover:text-white dark:bg-zinc-800 dark:text-zinc-100 md:h-10 md:w-auto md:px-4 md:gap-2 transition-all shadow-sm"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden md:inline font-bold text-xs uppercase tracking-wide">
                          Add
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col items-center justify-center text-center"
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-full border-border bg-background px-10 font-bold uppercase tracking-widest text-xs transition-transform hover:scale-105 active:scale-95 shadow-sm"
          >
            <Link href={viewAllHref}>Explore full catalogue</Link>
          </Button>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            Trusted by over 10,000+ customers
          </p>
        </motion.div>
      </div>
    </section>
  );
}
