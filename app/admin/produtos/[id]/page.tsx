import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import FormularioProduto from "../FormularioProduto";
import { atualizarProduto } from "../actions";

export default async function EditarProduto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: produto }, { data: categorias }] = await Promise.all([
    supabase
      .from("products")
      .select(
        `id, name, brand, category_id, tagline, description, highlights, warranty_months, free_shipping, ativo,
         em_destaque, parcelamento_habilitado, pix_desconto_percent,
         vendidos_texto, selo_texto, cupom_percent, parcelas_sem_juros, parcelas_com_juros, juros_mensal_percent,
         product_variants ( color, color_hex, storage_gb, condition, price_cents, compare_at_cents, stock, sku, photos, description )`
      )
      .eq("id", id)
      .single(),
    supabase.from("categories").select("id, nome").order("ordem"),
  ]);

  if (!produto) notFound();

  const acaoComId = atualizarProduto.bind(null, produto.id);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Editar produto</h1>
      <FormularioProduto
        categorias={categorias ?? []}
        action={acaoComId}
        produto={{
          id: produto.id,
          name: produto.name,
          brand: produto.brand ?? "",
          categoryId: produto.category_id,
          tagline: produto.tagline ?? "",
          description: produto.description ?? "",
          highlights: produto.highlights ?? [],
          warrantyMonths: produto.warranty_months,
          freeShipping: produto.free_shipping,
          ativo: produto.ativo,
          emDestaque: produto.em_destaque,
          parcelamentoHabilitado: produto.parcelamento_habilitado,
          pixDescontoPercent: produto.pix_desconto_percent,
          vendidosTexto: produto.vendidos_texto ?? "",
          seloTexto: produto.selo_texto ?? "",
          cupomPercent: produto.cupom_percent,
          parcelasSemJuros: produto.parcelas_sem_juros,
          parcelasComJuros: produto.parcelas_com_juros,
          jurosMensalPercent: produto.juros_mensal_percent,
          variantes: produto.product_variants.map((v) => ({
            color: v.color ?? "",
            colorHex: v.color_hex,
            storageGb: v.storage_gb?.toString() ?? "",
            condition: v.condition,
            price: (v.price_cents / 100).toString(),
            compareAt: v.compare_at_cents ? (v.compare_at_cents / 100).toString() : "",
            stock: v.stock.toString(),
            sku: v.sku ?? "",
            description: v.description ?? "",
            photos: v.photos ?? [],
          })),
        }}
      />
    </div>
  );
}
