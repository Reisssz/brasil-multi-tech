import { createClient } from "@/lib/supabase/server";
import FormularioProduto from "../FormularioProduto";
import { criarProduto } from "../actions";
import { listarPosicoesOcupadasDb } from "@/lib/data/products-db";

export default async function NovoProduto() {
  const supabase = await createClient();
  const [{ data: categorias }, posicoesOcupadas] = await Promise.all([
    supabase.from("categories").select("id, nome").order("ordem"),
    listarPosicoesOcupadasDb(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Novo produto</h1>
      <FormularioProduto categorias={categorias ?? []} action={criarProduto} posicoesOcupadas={posicoesOcupadas} />
    </div>
  );
}
