import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatBRL } from "@/lib/pricing";
import { atualizarStatusPedido, gerarEtiquetaDoPedido } from "./actions";
import { GerarEtiquetaButton } from "./GerarEtiquetaButton";

const ROTULO_STATUS: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export default async function AdminPedidoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pedido } = await supabase
    .from("orders")
    .select("id, status, subtotal, total, parcelas, metodo_pagamento, items, endereco_entrega, created_at, user_id")
    .eq("id", id)
    .single();

  if (!pedido) notFound();

  const { data: perfilCliente } = pedido.user_id
    ? await supabase.from("profiles").select("nome_completo, telefone").eq("id", pedido.user_id).single()
    : { data: null };

  const { data: pagamento } = await supabase
    .from("payments")
    .select("mp_payment_id, mp_status, mp_status_detail, metodo, valor")
    .eq("order_id", id)
    .maybeSingle();

  const { data: envio } = await supabase
    .from("shipments")
    .select("melhor_envio_id, status, tracking_code, tracking_url, price")
    .eq("order_id", id)
    .maybeSingle();

  const endereco = pedido.endereco_entrega as {
    cep?: string;
    street?: string;
    numero?: string;
    complemento?: string;
    city?: string;
    state?: string;
    nome?: string;
    documento?: string;
    telefone?: string;
    frete_nome?: string;
    frete_prazo_dias?: number;
    frete_valor?: number;
  } | null;

  const itens = (pedido.items ?? []) as Array<{
    nome: string;
    cor?: string;
    armazenamento?: number | null;
    quantidade: number;
    precoUnitarioCents: number;
    imagem?: string | null;
  }>;

  const acaoAtualizarStatus = atualizarStatusPedido.bind(null, pedido.id);
  const acaoGerarEtiqueta = gerarEtiquetaDoPedido.bind(null, pedido.id);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Pedido #{pedido.id.slice(0, 8)}</h1>
        <span className="rounded-full bg-brand-light text-brand-dark px-3 py-1 text-xs font-semibold">
          {ROTULO_STATUS[pedido.status] ?? pedido.status}
        </span>
      </div>

      <Secao titulo="Cliente">
        <Linha label="Nome" valor={perfilCliente?.nome_completo ?? endereco?.nome ?? "—"} />
        <Linha label="Telefone" valor={perfilCliente?.telefone ?? endereco?.telefone ?? "—"} />
        <Linha label="CPF" valor={endereco?.documento ?? "—"} />
      </Secao>

      <Secao titulo="Endereço de entrega">
        {endereco ? (
          <>
            <Linha
              label="Endereço"
              valor={`${endereco.street ?? ""}, ${endereco.numero ?? ""}${endereco.complemento ? ` — ${endereco.complemento}` : ""}`}
            />
            <Linha label="Cidade/UF" valor={`${endereco.city ?? "—"}/${endereco.state ?? "—"}`} />
            <Linha label="CEP" valor={endereco.cep ?? "—"} />
            <Linha
              label="Frete escolhido"
              valor={endereco.frete_nome ? `${endereco.frete_nome} — até ${endereco.frete_prazo_dias} dias úteis` : "—"}
            />
          </>
        ) : (
          <p className="text-sm text-muted">Endereço não registrado neste pedido.</p>
        )}
      </Secao>

      <Secao titulo="Itens">
        <div className="flex flex-col divide-y divide-border">
          {itens.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-foreground">{item.nome}</p>
                <p className="text-xs text-muted">
                  {[item.cor, item.armazenamento ? `${item.armazenamento}GB` : null].filter(Boolean).join(" · ")}
                  {" · "}
                  {item.quantidade}x
                </p>
              </div>
              <span className="font-semibold text-foreground tabular-nums">
                {formatBRL(item.precoUnitarioCents * item.quantidade)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-border pt-3 mt-3 font-bold text-foreground">
          <span>Total</span>
          <span className="tabular-nums">{formatBRL(Math.round(pedido.total * 100))}</span>
        </div>
      </Secao>

      <Secao titulo="Pagamento">
        {pagamento ? (
          <>
            <Linha label="Método" valor={pagamento.metodo ?? pedido.metodo_pagamento ?? "—"} />
            <Linha label="Status Mercado Pago" valor={pagamento.mp_status ?? "—"} />
            <Linha label="ID do pagamento" valor={pagamento.mp_payment_id ?? "—"} />
          </>
        ) : (
          <p className="text-sm text-muted">Nenhum pagamento confirmado registrado ainda.</p>
        )}
      </Secao>

      <Secao titulo="Envio">
        {envio ? (
          <>
            <Linha label="Status Melhor Envio" valor={envio.status} />
            <Linha label="Rastreio" valor={envio.tracking_code ?? "Aguardando código"} />
            {envio.tracking_url && (
              <a href={envio.tracking_url} target="_blank" className="text-sm text-brand-dark font-medium">
                Ver rastreio completo ↗
              </a>
            )}
          </>
        ) : pedido.status === "paid" ? (
          <GerarEtiquetaButton action={acaoGerarEtiqueta} />
        ) : (
          <p className="text-sm text-muted">Etiqueta só pode ser gerada depois do pagamento confirmado.</p>
        )}
      </Secao>

      <Secao titulo="Atualizar status manualmente">
        <form action={acaoAtualizarStatus} className="flex items-center gap-2">
          <select name="status" defaultValue={pedido.status} className="h-10 rounded-lg border border-border px-3 text-sm">
            {Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-10 rounded-lg bg-brand hover:bg-brand-dark px-4 text-sm font-semibold text-brand-foreground transition-colors"
          >
            Salvar status
          </button>
        </form>
        <p className="mt-2 text-xs text-muted">
          Use isso pra casos que não passam pela geração automática de etiqueta — ex: marcar como &quot;Entregue&quot; depois
          da confirmação da transportadora.
        </p>
      </Secao>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">{titulo}</h2>
      {children}
    </div>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-foreground text-right">{valor}</span>
    </div>
  );
}
