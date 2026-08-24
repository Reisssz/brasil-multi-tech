import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlugDb, getProductBySlugForMetadataDb, getRelatedProductsDb } from "@/lib/data/products-db";
import { getMinPriceCents } from "@/lib/data/products";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ComboSuggestions } from "@/components/product/ComboSuggestions";
import { getPixPriceCents } from "@/lib/pricing";
import { SITE } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugForMetadataDb(slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: `${product.brand} ${product.name} — ${product.tagline}`,
    description: product.description,
    openGraph: {
      title: `${product.brand} ${product.name}`,
      description: product.tagline,
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variante?: string }>;
}) {
  const { slug } = await params;
  const { variante: variantePreSelecionada } = await searchParams;
  const product = await getProductBySlugDb(slug);
  if (!product) notFound();

  const related = await getRelatedProductsDb(product);
  const priceCents = getMinPriceCents(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.name}`,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      url: `https://${SITE.domain}/produto/${product.slug}`,
      priceCurrency: "BRL",
      price: (getPixPriceCents(priceCents) / 100).toFixed(2),
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition:
        product.variants[0].condition === "novo"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail
        product={product}
        related={related}
        initialVariantId={variantePreSelecionada}
        comboSlot={
          <ComboSuggestions
            productId={product.id}
            category={product.category}
            productName={product.name}
            variant={product.variants[0]}
          />
        }
      />
    </>
  );
}