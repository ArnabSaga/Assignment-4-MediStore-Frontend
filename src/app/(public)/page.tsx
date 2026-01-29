import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
    </>
  );
}
