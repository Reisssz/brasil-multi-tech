import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ resultados: [] });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, brand, product_variants ( id, price_cents )")
    .eq("ativo", true)
    .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
    .limit(6);

  if (error) {
    console.error("[busca] erro:", error.message);
    return NextResponse.json({ resultados: [] });
  }

  const resultados = data.map((p) => {
    const variantes = p.product_variants as { id: string; price_cents: number }[];
    const maisBarata = variantes.reduce(
      (min, v) => (v.price_cents < min.price_cents ? v : min),
      variantes[0]
    );
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      minPriceCents: maisBarata?.price_cents ?? 0,
      variantId: maisBarata?.id ?? null,
    };
  });

  return NextResponse.json({ resultados });
}