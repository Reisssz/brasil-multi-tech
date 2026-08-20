import { products } from "@/lib/data/products";
import { CategoryListing } from "@/components/product/CategoryListing";

export const metadata = { title: "Produtos mais vendidos" };

export default function BestSellersPage() {
  const bestSellers = [...products].sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
  return <CategoryListing products={bestSellers} title="Produtos mais vendidos" />;
}
