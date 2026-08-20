import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getRelatedProducts, getMinPriceCents, products } from "@/lib/data/products";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getPixPriceCents } from "@/lib/pricing";
import { SITE } from "@/lib/config";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
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
      <ProductDetail product={product} related={related} />
    </>
  );
}
