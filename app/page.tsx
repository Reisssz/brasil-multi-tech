import { Hero } from "@/components/home/Hero";
import { QuickTiles } from "@/components/home/QuickTiles";
import { TrustBar } from "@/components/layout/TrustBar";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedOffers } from "@/components/home/FeaturedOffers";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { PromoBannerStrip } from "@/components/home/PromoBannerStrip";
import { TrustSection } from "@/components/home/TrustSection";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickTiles />
      <FeaturedOffers />
      <PromoCarousel />
      <CategoryShowcase />
      <PromoBannerStrip />
      <TrustSection />
      <TrustBar />
      <HowItWorks />
    </>
  );
}
