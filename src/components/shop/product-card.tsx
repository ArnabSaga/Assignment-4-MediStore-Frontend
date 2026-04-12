"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
}: {
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    image: string;
  };
}) {
  const hasDiscount = !!product.salePrice && product.salePrice < product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Link href={`/shop/${product.id}`} className="group block h-full">
        <Card className="shop-product-card h-full">
          <CardContent className="flex h-full flex-col p-0">
            <div className="shop-image-shell">
              {hasDiscount && (
                <span className="absolute left-3 top-3 z-20 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-sm">
                  Sale
                </span>
              )}

              <div className="shop-image-overlay" />

              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
              />

              <div className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-between opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 translate-y-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                  View details
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>

                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-md backdrop-blur-md dark:bg-white dark:text-black">
                  <ShoppingBag className="h-4 w-4" />
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4 md:p-5">
              <div className="mb-2">
                <p className="shop-subtle">MediStore item</p>
              </div>

              <p className="line-clamp-2 min-h-[2.8rem] text-sm font-semibold leading-6 md:text-[15px]">
                {product.name}
              </p>

              <div className="mt-auto pt-4">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Price
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {hasDiscount ? (
                        <>
                          <span className="shop-price">৳{product.salePrice}</span>
                          <span className="text-xs text-muted-foreground line-through">
                            ৳{product.price}
                          </span>
                        </>
                      ) : (
                        <span className="shop-price">৳{product.price}</span>
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-full border px-3 text-xs font-semibold transition-all duration-200",
                      "border-border/80 bg-background/70 backdrop-blur-sm",
                      "group-hover:border-primary/40 group-hover:bg-primary/8 group-hover:text-primary"
                    )}
                  >
                    Explore
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
