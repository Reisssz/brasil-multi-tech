import { createClient } from "@/lib/supabase/server";
import { criarCategoria, removerCategoria } from "./actions";

export default async function AdminCategorias() {
  const supabase = await createClient();
  const { data: categorias } = await supabase.from("categories").select("id, nome, slug").order("ordem");

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Categorias</h1>

      <form action={criarCategoria} className="mb-8 flex gap-2">
        <input
          name="nome"
          placeholder="Nome da categoria"
          required
          className="flex-1 h-11 rounded-lg border border-border px-3 text-sm"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand hover:bg-brand-dark px-5 text-sm font-semibold text-brand-foreground transition-colors"
        >
          Adicionar
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {categorias?.map((categoria) => (
          <div key={categoria.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <span className="text-sm font-medium text-foreground">{categoria.nome}</span>
            <form action={removerCategoria.bind(null, categoria.id)}>
              <button type="submit" className="text-xs text-red-500 hover:underline">
                Remover
              </button>
            </form>
          </div>
        ))}
        {(!categorias || categorias.length === 0) && (
          <p className="text-sm text-muted">Nenhuma categoria cadastrada.</p>
        )}
      </div>
    </div>
  );
}
