import { Hero } from "@/components/home/Hero";
import { QuickTiles } from "@/components/home/QuickTiles";
import { TrustBar } from "@/components/layout/TrustBar";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedOffers } from "@/components/home/FeaturedOffers";
import { Depoimentos } from "@/components/home/Depoimentos";
import { OfertasNotebooks } from "@/components/home/OfertasNotebooks";
import { SmartphonesGarantia } from "@/components/home/SmartphonesGarantia";
import { OfertasDoDia } from "@/components/home/OfertasDoDia";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { TrustSection } from "@/components/home/TrustSection";
import { listarBannersPromocionais, listarBannersPrincipais, getBannerGarantia } from "@/lib/banners";

export default function Home() {
  const bannersPrincipais = listarBannersPrincipais();
  const bannerGarantia = getBannerGarantia();
  const banners = [...listarBannersPromocionais(), ...(bannerGarantia ? [bannerGarantia] : [])];

  return (
    <>
      <Hero banners={bannersPrincipais} />
      <QuickTiles />
      <FeaturedOffers />
      <PromoCarousel banners={banners} />
      <Depoimentos />
      <OfertasNotebooks />
      <SmartphonesGarantia />
      <OfertasDoDia />
      <CategoryShowcase />
      <TrustSection />
      <TrustBar />
      <HowItWorks />
    </>
  );
}
