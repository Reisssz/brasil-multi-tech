import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/pricing";
import { atualizarStatusVenda, definirValorFinal } from "./actions";

const ROTULO_STATUS: Record<string, string> = {
  novo: "Novo",
  em_analise: "Em análise",
  proposta_enviada: "Proposta enviada",
  aceito: "Aceito",
  recusado: "Recusado",
  concluido: "Concluído",
};

const CORES_STATUS: Record<string, string> = {
  novo: "bg-brand-light text-brand-dark",
  em_analise: "bg-[#eef0f3] text-muted",
  proposta_enviada: "bg-blue-50 text-blue-700",
  aceito: "bg-success-light text-success",
  recusado: "bg-red-50 text-red-600",
  concluido: "bg-success-light text-success",
};

export default async function AdminVender() {
  const supabase = await createClient();
  const { data: solicitacoes } = await supabase
    .from("trade_in_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Venda de aparelhos</h1>

      <div className="flex flex-col gap-4">
        {solicitacoes?.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="font-bold text-foreground">
                  {s.brand} {s.model} {s.storage_gb ? `— ${s.storage_gb}GB` : ""}
                </h2>
                <p className="text-xs text-muted">
                  {s.contact_name} · {s.contact_phone} · {s.contact_email}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${CORES_STATUS[s.status] ?? ""}`}>
                {ROTULO_STATUS[s.status] ?? s.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
              <Info label="Tela" valor={s.screen_condition} />
              <Info label="Carcaça" valor={s.body_condition} />
              <Info label="Bateria" valor={s.battery_health} />
              <Info label="Liga normalmente" valor={s.turns_on ? "Sim" : "Não"} />
            </div>

            {s.broken_parts?.length > 0 && (
              <p className="text-xs text-red-600 mb-1">Peças quebradas: {s.broken_parts.join(", ")}</p>
            )}
            {s.replaced_parts?.length > 0 && (
              <p className="text-xs text-muted mb-1">Peças trocadas: {s.replaced_parts.join(", ")}</p>
            )}
            {s.notes && <p className="text-xs text-muted mb-2 italic">&ldquo;{s.notes}&rdquo;</p>}

            <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
              <div className="text-sm">
                <span className="text-muted">Estimativa automática: </span>
                <span className="font-semibold text-foreground">
                  {s.estimated_value_cents ? formatBRL(s.estimated_value_cents) : "—"}
                </span>
                {s.final_value_cents && (
                  <span className="ml-3 text-success font-semibold">
                    Proposta final: {formatBRL(s.final_value_cents)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <form action={definirValorFinal.bind(null, s.id)} className="flex items-center gap-2">
                <input
                  name="valorFinal"
                  type="number"
                  step="0.01"
                  placeholder="Valor final (R$)"
                  className="h-9 w-36 rounded-lg border border-border px-2 text-xs"
                />
                <button type="submit" className="h-9 rounded-lg bg-brand hover:bg-brand-dark px-3 text-xs font-semibold text-brand-foreground transition-colors">
                  Enviar proposta
                </button>
              </form>

              <form
                action={async (formData: FormData) => {
                  "use server";
                  await atualizarStatusVenda(s.id, String(formData.get("status")));
                }}
                className="flex items-center gap-2"
              >
                <select name="status" defaultValue={s.status} className="h-9 rounded-lg border border-border px-2 text-xs">
                  {Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>
                      {rotulo}
                    </option>
                  ))}
                </select>
                <button type="submit" className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-[#f7f8fa] transition-colors">
                  Atualizar status
                </button>
              </form>
            </div>
          </div>
        ))}

        {(!solicitacoes || solicitacoes.length === 0) && (
          <p className="text-center text-muted py-8">Nenhuma solicitação de venda ainda.</p>
        )}
      </div>
    </div>
  );
}

function Info({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-lg bg-[#f7f8fa] px-2.5 py-1.5">
      <span className="block text-[10px] text-muted uppercase">{label}</span>
      <span className="font-medium text-foreground">{valor.replace(/_/g, " ")}</span>
    </div>
  );
}
