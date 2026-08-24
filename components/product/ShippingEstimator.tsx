"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/pricing";

type OpcaoFrete = {
  id: number;
  nome: string;
  transportadora: string;
  precoComDescontoCents: number;
  prazoDias: number;
};

type ItemParaCalculo = {
  productId: string;
  variantId: string;
  quantity: number;
};

export function ShippingEstimator({ items }: { items: ItemParaCalculo[] }) {
  const [aberto, setAberto] = useState(false);
  const [cep, setCep] = useState("");
  const [calculando, setCalculando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[] | null>(null);
  const [freteGratis, setFreteGratis] = useState(false);

  async function calcular(e: React.FormEvent) {
    e.preventDefault();
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setErro("Digite um CEP válido, com 8 números.");
      return;
    }

    setErro(null);
    setCalculando(true);
    setOpcoes(null);

    try {
      const resposta = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: cepLimpo, items }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error ?? "Não foi possível calcular o frete agora.");
        return;
      }

      setOpcoes(dados.opcoes);
      setFreteGratis(Boolean(dados.freteGratis));
    } catch {
      setErro("Não foi possível calcular o frete agora. Tente novamente em instantes.");
    } finally {
      setCalculando(false);
    }
  }

  return (
    <div className="border-t border-b border-border py-3">
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-2.5 text-sm text-foreground"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-muted shrink-0">
          <rect x="3" y="7" width="13" height="10" rx="1" />
          <path d="M16 10h3.2a1 1 0 0 1 .9.55L21 13v4h-5" />
          <circle cx="7.5" cy="18.5" r="1.5" />
          <circle cx="17.5" cy="18.5" r="1.5" />
        </svg>
        <span>
          Receba em seu endereço —{" "}
          <span className="font-semibold text-brand-dark underline underline-offset-2">Consultar entrega</span>
        </span>
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4" onClick={() => setAberto(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-surface p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Calcular frete</h2>
              <button onClick={() => setAberto(false)} aria-label="Fechar" className="text-muted hover:text-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={calcular} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
                CEP
                <input
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  inputMode="numeric"
                  className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                />
              </label>

              <a
                href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-dark self-start"
              >
                Não sei meu CEP ↗
              </a>

              <button
                type="submit"
                disabled={calculando}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-60 text-brand-foreground font-bold text-sm transition-colors"
              >
                {calculando ? "Calculando…" : "Calcular o frete"}
              </button>
            </form>

            {erro && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}

            {freteGratis && opcoes && opcoes.length > 0 && (
              <p className="mt-3 rounded-lg bg-success-light px-3 py-2 text-sm font-medium text-success">
                🎉 Este produto tem frete grátis!
              </p>
            )}

            {opcoes && opcoes.length > 0 && (
              <div className="mt-4 flex flex-col divide-y divide-border border-t border-border">
                {opcoes.map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{o.nome}</p>
                      <p className="text-xs text-muted">Em até {o.prazoDias} dias úteis</p>
                    </div>
                    <span className={`text-sm font-bold ${o.precoComDescontoCents === 0 ? "text-success" : "text-foreground"}`}>
                      {o.precoComDescontoCents === 0 ? "Grátis" : formatBRL(o.precoComDescontoCents)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}