"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShopFilters } from "./shop-filters";

export function MobileFilters({ activeCategory }: { activeCategory?: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="btn-outline h-11 w-full justify-center rounded-2xl border-border/70 bg-card/70 text-sm font-semibold backdrop-blur-sm"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Browse Filters
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[88vw] max-w-sm border-r border-border/70 bg-background/92 px-0 backdrop-blur-2xl"
      >
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="h-full"
        >
          <SheetHeader className="border-b border-border/70 px-5 py-4 text-left">
            <SheetTitle className="text-left text-lg font-semibold">Filter Products</SheetTitle>
          </SheetHeader>

          <div className="p-4">
            <ShopFilters activeCategory={activeCategory} />
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
