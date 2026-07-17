import { Hero } from "@/components/home/Hero";
import { QuickTiles } from "@/components/home/QuickTiles";
import { TrustBar } from "@/components/layout/TrustBar";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedOffers } from "@/components/home/FeaturedOffers";
import { PromoBannerStrip } from "@/components/home/PromoBannerStrip";
import { InstallmentSimulator } from "@/components/home/InstallmentSimulator";
import { TrustSection } from "@/components/home/TrustSection";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickTiles />
      <TrustBar />
      <CategoryShowcase />
      <FeaturedOffers />
      <PromoBannerStrip />
      <InstallmentSimulator />
      <TrustSection />
    </>
  );
}
