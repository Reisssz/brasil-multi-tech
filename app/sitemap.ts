import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${SITE.domain}`;
  const supabase = createAdminClient();

  const [{ data: categorias }, { data: produtos }] = await Promise.all([
    supabase.from("categories").select("slug"),
    supabase.from("products").select("slug").eq("ativo", true),
  ]);

  const staticRoutes = ["", "/ajuda", "/garantia", "/pedido/rastreio", "/categoria/ofertas"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = (categorias ?? []).map((c) => ({
    url: `${base}/categoria/${c.slug}`,
    lastModified: new Date(),
  }));

  const productRoutes = (produtos ?? []).map((p) => ({
    url: `${base}/produto/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
