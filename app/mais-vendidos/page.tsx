import { getFeaturedProductsDb } from "@/lib/data/products-db";
import { CategoryListing } from "@/components/product/CategoryListing";

export const metadata = { title: "Produtos mais vendidos" };

export default async function BestSellersPage() {
  const bestSellers = await getFeaturedProductsDb(50);
  return <CategoryListing products={bestSellers} title="Produtos mais vendidos" />;
}
