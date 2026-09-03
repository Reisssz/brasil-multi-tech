import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/pricing";
import { atualizarStatusVenda } from "./actions";

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
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="font-display text-2xl font-bold text-foreground">Venda de aparelhos</h1>
        <Link href="/admin/vender/precos" className="text-sm font-semibold text-brand-dark hover:underline shrink-0">
          Editar preços de avaliação →
        </Link>
      </div>
      <p className="text-sm text-muted mb-6">
        O cliente escolhe a modalidade, assina o contrato e informa como quer receber sozinho — nada disso
        precisa de ação sua. A única coisa que sobra é marcar como <strong>Concluído</strong> depois de enviar o
        pagamento (Pix/transferência) por fora do sistema.
      </p>

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
                <p className="text-xs text-muted mt-0.5">
                  IMEI: <span className="font-mono">{s.imei ?? "—"}</span>
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${CORES_STATUS[s.status] ?? ""}`}>
                {ROTULO_STATUS[s.status] ?? s.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
              <Info label="Liga" valor={s.turns_on ? "Sim" : "Não"} />
              <Info label="Faz/recebe ligação" valor={s.faz_recebe_ligacoes ? "Sim" : "Não"} />
              <Info label="Wifi/Bluetooth" valor={s.wifi_bluetooth_ok ? "Sim" : "Não"} />
              <Info label="Marcas de uso" valor={s.marcas_de_uso} />
              <Info label="Traseira/lateral danificada" valor={s.traseira_lateral_danificada ? "Sim" : "Não"} />
              <Info label="Tela danificada" valor={s.tela_danificada ? "Sim" : "Não"} />
              <Info label="Biometria funciona" valor={s.biometria_funciona ? "Sim" : "Não"} />
              <Info label="Câmera com problema" valor={s.camera_com_problema ? "Sim" : "Não"} />
              <Info label="Saúde da bateria" valor={s.saude_bateria} />
              <Info label="Peça não genuína" valor={s.peca_nao_genuina ? "Sim" : "Não"} />
            </div>

            {s.notes && <p className="text-xs text-muted mb-2 italic">&ldquo;{s.notes}&rdquo;</p>}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 mt-3 text-sm">
              <span>
                <span className="text-muted">Modalidade: </span>
                <span className="font-semibold text-foreground">
                  {s.offer_type === "mais_valor" ? "Venda Mais Valor" : s.offer_type === "agora" ? "Venda Agora" : "—"}
                </span>
              </span>
              <span>
                <span className="text-muted">Estimativa automática: </span>
                <span className="font-semibold text-foreground">
                  {s.estimated_value_cents ? formatBRL(s.estimated_value_cents) : "—"}
                </span>
              </span>
              {s.final_value_cents && (
                <span className="text-success font-semibold">Proposta final: {formatBRL(s.final_value_cents)}</span>
              )}
            </div>

            {s.contract_accepted_at && (
              <p className="text-xs text-success mt-2">
                ✓ Contrato assinado por {s.contract_accepted_name} em{" "}
                {new Date(s.contract_accepted_at).toLocaleString("pt-BR")}
              </p>
            )}

            {s.payment_method && (
              <p className="text-xs text-muted mt-1">
                Receber por <strong>{s.payment_method === "pix" ? "Pix" : "Transferência"}</strong>:{" "}
                {s.payment_method === "pix" ? s.payment_pix_key : s.payment_bank_details}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
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

function Info({ label, valor }: { label: string; valor: string | null | undefined }) {
  return (
    <div className="rounded-lg bg-[#f7f8fa] px-2.5 py-1.5">
      <span className="block text-[10px] text-muted uppercase">{label}</span>
      <span className="font-medium text-foreground">{valor ? valor.replace(/_/g, " ") : "—"}</span>
    </div>
  );
}
