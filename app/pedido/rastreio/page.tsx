"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatBRL } from "@/lib/pricing";

const STAGES = [
  { key: "pending", label: "Aguardando pagamento" },
  { key: "paid", label: "Pagamento confirmado" },
  { key: "shipped", label: "Pedido enviado" },
  { key: "delivered", label: "Entregue" },
] as const;

type Pedido = {
  id: string;
  status: string;
  total: number;
  items: Array<{ nome: string; cor: string; quantidade: number }>;
  endereco_entrega: { street: string; city: string; state: string };
  created_at: string;
};

type Envio = { status: string; tracking_code: string | null; tracking_url: string | null } | null;

function TrackingContent() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("id") ?? "");
  const [pedido, setPedido] = useState<Pedido | null | undefined>(undefined);
  const [envio, setEnvio] = useState<Envio>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function buscar(id: string) {
    if (!id.trim()) return;
    setCarregando(true);
    setErro(null);
    setPedido(undefined);

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
    } catch {
      setErro("Não foi possível buscar o pedido agora.");
      setPedido(null);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const inicial = searchParams.get("id");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (inicial) buscar(inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const indiceAtual = pedido
    ? STAGES.findIndex((s) => s.key === pedido.status) >= 0
      ? STAGES.findIndex((s) => s.key === pedido.status)
      : 0
    : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Rastrear pedido</h1>
      <p className="text-sm text-muted mb-6">Informe o número do seu pedido para acompanhar a entrega.</p>

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
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted uppercase">Pedido</span>
              <h2 className="text-lg font-bold text-foreground">#{pedido.id.slice(0, 8)}</h2>
            </div>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {formatBRL(Math.round(pedido.total * 100))}
            </span>
          </div>

          <Timeline indiceAtual={indiceAtual} />

          {envio?.tracking_code && (
            <div className="rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm">
              <span className="text-muted">Código de rastreio: </span>
              {envio.tracking_url ? (
                <a href={envio.tracking_url} target="_blank" className="font-semibold text-brand-dark">
                  {envio.tracking_code}
                </a>
              ) : (
                <span className="font-semibold text-foreground">{envio.tracking_code}</span>
              )}
            </div>
          )}

          <div className="border-t border-border pt-4 text-sm text-muted">
            <p>
              Entrega para {pedido.endereco_entrega.street}, {pedido.endereco_entrega.city}/
              {pedido.endereco_entrega.state}
            </p>
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
        const done = i <= indiceAtual;
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

export default function TrackingPage() {
  return (
    <Suspense>
      <TrackingContent />
    </Suspense>
  );
}
