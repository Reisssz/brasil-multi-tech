"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOrder, getOrderStage, OrderRecord, ORDER_STAGES } from "@/lib/orders";
import { formatBRL } from "@/lib/pricing";

function TrackingContent() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("id") ?? "");
  const [order, setOrder] = useState<OrderRecord | null | undefined>(undefined);

  function lookup(id: string) {
    const found = getOrder(id);
    setOrder(found ?? null);
  }

  useEffect(() => {
    // One-time sync from the URL's ?id= on mount: order data only exists in this
    // browser's localStorage, so it must be read after hydration to avoid a
    // server/client markup mismatch (server has no access to localStorage).
    const initial = searchParams.get("id");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initial) lookup(initial);
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-extrabold text-foreground mb-2">Rastrear pedido</h1>
      <p className="text-sm text-muted mb-6">Informe o número do seu pedido para acompanhar a entrega.</p>

      <div className="flex gap-3 mb-8">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: BMT-482913"
          className="flex-1 h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
        />
        <button
          onClick={() => lookup(input)}
          className="inline-flex items-center justify-center rounded-lg bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 px-5 text-sm transition-colors"
        >
          Buscar
        </button>
      </div>

      {order === null && (
        <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
          Não encontramos nenhum pedido com esse número neste navegador. Pedidos ficam salvos localmente nesta
          demonstração — confira se a busca está sendo feita no mesmo navegador da compra.
        </div>
      )}

      {order && (
        <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted uppercase">Pedido</span>
              <h2 className="text-lg font-bold text-foreground">{order.id}</h2>
            </div>
            <span className="text-sm font-semibold text-foreground tabular-nums">{formatBRL(order.totalCents)}</span>
          </div>

          <Timeline order={order} />

          <div className="border-t border-border pt-4 text-sm text-muted">
            <p>
              Entrega para {order.address.street}, {order.address.city}/{order.address.state}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Timeline({ order }: { order: OrderRecord }) {
  const { currentIndex } = getOrderStage(order);
  return (
    <div className="flex flex-col gap-0">
      {ORDER_STAGES.map((stage, i) => {
        const done = i <= currentIndex;
        const isLast = i === ORDER_STAGES.length - 1;
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
