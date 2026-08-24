import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductsByCategoryDb, getCategoryNameBySlugDb } from "@/lib/data/products-db";
import { CategoryListing } from "@/components/product/CategoryListing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "ofertas") return { title: "Ofertas" };
  const nome = await getCategoryNameBySlugDb(slug);
  return { title: nome ?? "Categoria" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === "ofertas") {
    const offers = await getProductsByCategoryDb("ofertas");
    return <CategoryListing products={offers} title="Ofertas" />;
  }

  const nome = await getCategoryNameBySlugDb(slug);
  if (!nome) notFound();

  const items = await getProductsByCategoryDb(slug);
  return <CategoryListing products={items} title={nome} />;
}
