import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ resultados: [] });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, brand, product_variants ( price_cents )")
    .eq("ativo", true)
    .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
    .limit(6);

  if (error) {
    console.error("[busca] erro:", error.message);
    return NextResponse.json({ resultados: [] });
  }

  const resultados = data.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    minPriceCents: Math.min(...p.product_variants.map((v: { price_cents: number }) => v.price_cents), Infinity),
  }));

  return NextResponse.json({ resultados });
}
