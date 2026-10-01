"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatBRL } from "@/lib/pricing";

const STAGES = [
  { key: "created", label: "Pedido realizado" },
  { key: "paid", label: "Pagamento confirmado" },
  { key: "preparing", label: "Pedido em preparação" },
  { key: "shipped", label: "Enviado" },
  { key: "in_transit", label: "Em transporte" },
  { key: "delivered", label: "Entregue" },
] as const;

type Pedido = {
  id: string;
  status: string;
  total: number;
  metodo_pagamento: string | null;
  items: Array<{ nome: string; cor?: string | null; armazenamento?: number | null; quantidade: number; precoUnitarioCents: number; imagem?: string | null }>;
  endereco_entrega: { nome?: string; cep?: string; street?: string; numero?: string; complemento?: string; bairro?: string; city?: string; state?: string; frete_nome?: string; frete_prazo_dias?: number } | null;
  created_at: string;
};

type Envio = { status: string; tracking_code: string | null; tracking_url: string | null } | null;
type Pagamento = { mp_status: string | null; mp_status_detail: string | null; metodo: string | null; valor: number | null } | null;

function rotuloPagamento(status?: string | null) {
  const rotulos: Record<string, string> = {
    approved: "Aprovado",
    pending: "Pendente",
    in_process: "Em análise",
    rejected: "Recusado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    charged_back: "Contestado",
  };
  return status ? rotulos[status] ?? status.replace(/_/g, " ") : "Aguardando confirmação";
}

function rotuloMetodo(metodo?: string | null) {
  const rotulos: Record<string, string> = { pix: "Pix", credit_card: "Cartão de crédito", debit_card: "Cartão de débito", boleto: "Boleto", cartao: "Cartão" };
  return metodo ? rotulos[metodo] ?? metodo.replace(/_/g, " ") : "Não informado";
}

function etapaPedido(pedido: Pedido, envio: Envio) {
  if (pedido.status === "delivered" || statusEhEntregue(envio?.status)) return 5;
  if (pedido.status === "shipped") {
    return statusEmTransito(envio?.status) ? 4 : 3;
  }
  if (pedido.status === "preparing") return 2;
  if (pedido.status === "paid") return 2;
  if (pedido.status === "pending") return 0;
  return -1;
}

function statusEhEntregue(status?: string | null) {
  return !!status && /deliver|entreg|received/.test(status.toLowerCase());
}

function statusEmTransito(status?: string | null) {
  return !!status && /transit|transport|in_route|out_for_delivery|posted|collected|shipped/.test(status.toLowerCase());
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("id") ?? "");
  const [pedido, setPedido] = useState<Pedido | null | undefined>(undefined);
  const [envio, setEnvio] = useState<Envio>(null);
  const [pagamento, setPagamento] = useState<Pagamento>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);

  const buscar = useCallback(async (id: string) => {
    if (!id.trim()) return;
    setCarregando(true);
    setErro(null);
    if (pedido?.id !== id.trim()) setPedido(undefined);

    try {
      const resposta = await fetch(`/api/pedidos?id=${encodeURIComponent(id.trim())}`);
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error ?? "Pedido não encontrado.");
        setPedido(null);
        return;
      }

      setPedido(dados.pedido);
      setEnvio(dados.envio);
      setPagamento(dados.pagamento);
      setAtualizadoEm(new Date());
    } catch {
      setErro("Não foi possível buscar o pedido agora.");
      setPedido(null);
    } finally {
      setCarregando(false);
    }
  }, [pedido?.id]);

  useEffect(() => {
    const inicial = searchParams.get("id");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (inicial) buscar(inicial);
  }, [searchParams, buscar]);

  useEffect(() => {
    if (!pedido?.id) return;
    const intervalo = window.setInterval(() => buscar(pedido.id), 30000);
    return () => window.clearInterval(intervalo);
  }, [pedido?.id, buscar]);

  const indiceAtual = pedido ? etapaPedido(pedido, envio) : 0;
  const endereco = pedido?.endereco_entrega;
  const statusPagamento =
    pagamento?.mp_status ??
    (pedido?.status === "paid" || pedido?.status === "preparing" || pedido?.status === "shipped" || pedido?.status === "delivered"
      ? "approved"
      : pedido?.status === "cancelled" || pedido?.status === "refunded"
        ? pedido.status
        : null);

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 lg:px-12 py-12">
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Rastrear pedido</h1>
      <p className="text-sm text-muted mb-6">Entre na sua conta para acompanhar pagamento, preparação e entrega do pedido.</p>

      <div className="flex gap-3 mb-8">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Cole o número do pedido"
          className="flex-1 h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
        />
        <button
          onClick={() => buscar(input)}
          disabled={carregando}
          className="inline-flex items-center justify-center rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-50 text-brand-foreground font-semibold h-11 px-5 text-sm transition-colors"
        >
          {carregando ? "Buscando…" : "Buscar"}
        </button>
      </div>

      {pedido === null && (
        <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
          {erro ?? "Não encontramos nenhum pedido com esse número na sua conta."}
        </div>
      )}

      {pedido && (
        <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs text-muted uppercase">Pedido</span>
              <h2 className="text-lg font-bold text-foreground break-all">#{pedido.id}</h2>
              <p className="text-xs text-muted mt-1">
                Compra em {new Date(pedido.created_at).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <span className="text-base font-bold text-foreground tabular-nums">
              {formatBRL(Math.round(pedido.total * 100))}
            </span>
          </div>

          {pedido.status === "cancelled" || pedido.status === "refunded" ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Pedido {pedido.status === "cancelled" ? "cancelado" : "reembolsado"}. Confira os detalhes do pagamento abaixo.
            </div>
          ) : (
            <Timeline indiceAtual={indiceAtual} />
          )}

          <div className="grid sm:grid-cols-2 gap-3 border-y border-border py-4">
            <Info label="Pagamento" valor={rotuloPagamento(statusPagamento)} />
            <Info label="Forma de pagamento" valor={rotuloMetodo(pagamento?.metodo ?? pedido.metodo_pagamento)} />
          </div>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Produtos</h3>
            <div className="flex flex-col divide-y divide-border">
              {pedido.items.map((item, i) => (
                <div key={`${item.nome}-${i}`} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.nome}</p>
                    <p className="text-xs text-muted">
                      {[item.cor, item.armazenamento ? `${item.armazenamento}GB` : null, `${item.quantidade}x`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatBRL(item.precoUnitarioCents * item.quantidade)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {envio?.tracking_code && (
            <div className="rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm">
              <span className="text-muted">Código de rastreio: </span>
              {envio.tracking_url ? (
                <a href={envio.tracking_url} target="_blank" rel="noreferrer" className="font-semibold text-brand-dark">
                  {envio.tracking_code}
                </a>
              ) : (
                <span className="font-semibold text-foreground">{envio.tracking_code}</span>
              )}
            </div>
          )}

          <div className="border-t border-border pt-4 text-sm">
            <h3 className="font-semibold text-foreground mb-2">Entrega</h3>
            <p className="text-muted">
              {endereco?.nome ? `${endereco.nome} · ` : ""}
              {[endereco?.street, endereco?.numero, endereco?.complemento, endereco?.bairro].filter(Boolean).join(", ") || "Endereço não registrado"}
              {endereco?.city ? ` · ${endereco.city}/${endereco.state ?? ""}` : ""}
              {endereco?.cep ? ` · CEP ${endereco.cep}` : ""}
            </p>
            {endereco?.frete_nome && (
              <p className="text-xs text-muted mt-1">
                {endereco.frete_nome}{endereco.frete_prazo_dias ? ` · prazo estimado de ${endereco.frete_prazo_dias} dias úteis` : ""}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
            <span>{atualizadoEm ? `Atualizado ${atualizadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : ""}</span>
            <button type="button" onClick={() => buscar(pedido.id)} disabled={carregando} className="font-semibold text-brand-dark hover:underline disabled:opacity-50">
              {carregando ? "Atualizando…" : "Atualizar status"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Timeline({ indiceAtual }: { indiceAtual: number }) {
  return (
    <div className="flex flex-col gap-0">
      {STAGES.map((stage, i) => {
        const done = indiceAtual >= 0 && i <= indiceAtual;
        const isLast = i === STAGES.length - 1;
        return (
          <div key={stage.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 ${
                  done ? "bg-brand text-brand-foreground" : "bg-[#eef0f3] text-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              {!isLast && <span className={`w-px flex-1 min-h-6 ${done ? "bg-brand" : "bg-border"}`} />}
            </div>
            <div className="pb-5">
              <span className={`text-sm font-medium ${done ? "text-foreground" : "text-muted"}`}>{stage.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Info({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold text-foreground">{valor}</p>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense>
      <TrackingContent />
    </Suspense>
  );
}
