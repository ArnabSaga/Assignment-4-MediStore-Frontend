import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { DealBanner } from "@/components/home/DealBanner";
import { TeamSection } from "@/components/home/TeamSection";
import { TrustSection } from "@/components/home/TrustSection";

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <TrustSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <DealBanner />
      <TeamSection />
    </main>
  );
}
