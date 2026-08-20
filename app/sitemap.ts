import { MetadataRoute } from "next";
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { SITE } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${SITE.domain}`;

  const staticRoutes = ["", "/ajuda", "/garantia", "/pedido/rastreio", "/categoria/ofertas"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/categoria/${c.slug}`,
    lastModified: new Date(),
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/produto/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
