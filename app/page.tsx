import { Hero } from "@/components/home/Hero";
import { QuickTiles } from "@/components/home/QuickTiles";
import { TrustBar } from "@/components/layout/TrustBar";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedOffers } from "@/components/home/FeaturedOffers";
import { PromoBannerStrip } from "@/components/home/PromoBannerStrip";
import { InstallmentSimulator } from "@/components/home/InstallmentSimulator";
import { TrustSection } from "@/components/home/TrustSection";
import { getFeaturedProductsDb } from "@/lib/data/products-db";

export default async function Home() {
  const produtosSimulador = await getFeaturedProductsDb(20);

  return (
    <>
      <Hero />
      <QuickTiles />
      <TrustBar />
      <HowItWorks />
      <CategoryShowcase />
      <FeaturedOffers />
      <PromoBannerStrip />
      <InstallmentSimulator products={produtosSimulador} />
      <TrustSection />
    </>
  );
}
