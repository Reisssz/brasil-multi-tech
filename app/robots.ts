import { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/carrinho", "/pedido/confirmacao"],
    },
    sitemap: `https://${SITE.domain}/sitemap.xml`,
  };
}
