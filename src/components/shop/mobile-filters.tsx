"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShopFilters } from "./shop-filters";

export function MobileFilters({ activeCategory }: { activeCategory?: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="btn-outline w-full">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-85 max-w-[90vw]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <ShopFilters activeCategory={activeCategory} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
