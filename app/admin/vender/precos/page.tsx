import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { atualizarPrecoBase, removerPrecoBase } from "./actions";
import { NovoPrecoForm } from "./NovoPrecoForm";

export default async function AdminVenderPrecos() {
  const supabase = await createClient();
  const { data: precos } = await supabase
    .from("trade_in_base_prices")
    .select("*")
    .order("brand")
    .order("model");

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <Link href="/admin/vender" className="text-xs text-muted hover:underline">
        ← Voltar pra venda de aparelhos
      </Link>
      <h1 className="font-display text-2xl font-bold text-foreground mt-2 mb-1">Preços de avaliação</h1>
      <p className="text-sm text-muted mb-6">
        Valor-base pra um aparelho em condição excelente, 64/128GB — a estimativa automática ajusta a partir
        daqui conforme as respostas do formulário de venda (armazenamento, tela, bateria, marcas de uso etc).
      </p>

      <NovoPrecoForm />

      <div className="flex flex-col gap-2">
        {precos?.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{p.brand}</p>
              <p className="text-xs text-muted">{p.model}</p>
            </div>
            <div className="flex items-center gap-2">
              <form action={atualizarPrecoBase.bind(null, p.id)} className="flex items-center gap-1.5">
                <input
                  name="valor"
                  type="number"
                  step="0.01"
                  min={0.01}
                  defaultValue={(p.valor_cents / 100).toFixed(2)}
                  className="h-9 w-28 rounded-lg border border-border px-2 text-sm"
                />
                <button type="submit" className="h-9 rounded-lg bg-brand hover:bg-brand-dark px-3 text-xs font-semibold text-brand-foreground transition-colors">
                  Salvar
                </button>
              </form>
              <form action={removerPrecoBase.bind(null, p.id)}>
                <button type="submit" className="text-xs text-red-500 hover:underline">
                  Remover
                </button>
              </form>
            </div>
          </div>
        ))}
        {(!precos || precos.length === 0) && <p className="text-sm text-muted">Nenhum modelo cadastrado ainda.</p>}
      </div>
    </div>
  );
}
