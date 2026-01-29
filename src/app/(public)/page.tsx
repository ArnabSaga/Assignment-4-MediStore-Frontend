import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { DealBanner } from "@/components/home/DealBanner";
import { TeamSection } from "@/components/home/TeamSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
      <DealBanner />
      <TeamSection />
    </>
  );
}
