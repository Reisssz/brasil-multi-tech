import { createClient } from "@/lib/supabase/server";
import { CupomForm } from "./CupomForm";
import { alternarCupom, removerCupom } from "./actions";

export default async function AdminCupons() {
  const supabase = await createClient();
  const { data: cupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">Cupons de desconto</h1>
      <p className="text-sm text-muted mb-6">
        Cadastre aqui cupons como o de primeira compra. Por enquanto isso só registra o cupom — aplicar o código
        no checkout é um próximo passo, ainda não integrado.
      </p>

      <CupomForm />

      <div className="flex flex-col gap-2">
        {cupons?.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-foreground">{c.codigo}</span>
                <span className="text-xs font-semibold text-brand-dark">{c.desconto_percent}% OFF</span>
                {!c.ativo && (
                  <span className="text-xs font-semibold text-muted bg-[#eef0f3] rounded-full px-2 py-0.5">
                    Inativo
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                {c.somente_primeira_compra ? "Só primeira compra" : "Qualquer compra"}
                {c.validade && ` · válido até ${new Date(c.validade).toLocaleDateString("pt-BR")}`}
                {c.usos_maximos && ` · ${c.usos_atuais}/${c.usos_maximos} usos`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <form action={alternarCupom.bind(null, c.id, !c.ativo)}>
                <button type="submit" className="text-xs font-medium text-brand-dark hover:underline">
                  {c.ativo ? "Desativar" : "Ativar"}
                </button>
              </form>
              <form action={removerCupom.bind(null, c.id)}>
                <button type="submit" className="text-xs text-red-500 hover:underline">
                  Remover
                </button>
              </form>
            </div>
          </div>
        ))}
        {(!cupons || cupons.length === 0) && <p className="text-sm text-muted">Nenhum cupom cadastrado.</p>}
      </div>
    </div>
  );
}
