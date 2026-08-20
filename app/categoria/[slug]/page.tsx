import { notFound } from "next/navigation";
import { Metadata } from "next";
import { categories, getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategory, products } from "@/lib/data/products";
import { CategoryListing } from "@/components/product/CategoryListing";

export function generateStaticParams() {
  return [...categories.map((c) => ({ slug: c.slug })), { slug: "ofertas" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "ofertas") return { title: "Ofertas" };
  const category = getCategoryBySlug(slug);
  return { title: category ? category.name : "Categoria" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === "ofertas") {
    const offers = products.filter((p) => p.variants.some((v) => v.compareAtCents && v.compareAtCents > v.priceCents));
    return <CategoryListing products={offers} title="Ofertas" />;
  }

  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const items = getProductsByCategory(slug);
  return <CategoryListing products={items} title={category.name} />;
}
