"use client";

import { useActionState, useState } from "react";
import { atualizarConfiguracaoParcelamento } from "./actions";
import type { ConfiguracaoParcelamento } from "@/lib/pricing";

export function FormularioParcelamento({ config }: { config: ConfiguracaoParcelamento }) {
  const [estado, formAction, pending] = useActionState(atualizarConfiguracaoParcelamento, null);
  const [maxSemJuros, setMaxSemJuros] = useState(config.maxParcelasSemJuros);
  const [maxComJuros, setMaxComJuros] = useState(config.maxParcelasComJuros);
  const [juros, setJuros] = useState<Record<number, string>>(() =>
    Object.fromEntries(Object.entries(config.jurosCompradorPercent).map(([n, v]) => [Number(n), String(v)]))
  );

  const parcelasComJuros: number[] = [];
  for (let n = maxSemJuros + 1; n <= maxComJuros; n++) parcelasComJuros.push(n);

  function atualizarJuros(n: number, valor: string) {
    setJuros((atual) => ({ ...atual, [n]: valor }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Máximo de parcelas sem juros
          <input
            name="maxParcelasSemJuros"
            type="number"
            min={1}
            max={24}
            value={maxSemJuros}
            onChange={(e) => setMaxSemJuros(Number(e.target.value) || 1)}
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Máximo de parcelas com juros
          <input
            name="maxParcelasComJuros"
            type="number"
            min={maxSemJuros}
            max={24}
            value={maxComJuros}
            onChange={(e) => setMaxComJuros(Number(e.target.value) || maxSemJuros)}
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
          />
        </label>
      </div>

      {parcelasComJuros.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-foreground">
            Juros do comprador por parcela — copie de &ldquo;Seu negócio → Taxas e parcelamento&rdquo; no painel
            Mercado Pago
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {parcelasComJuros.map((n) => (
              <label key={n} className="flex flex-col gap-1 text-xs font-medium text-muted">
                {n}x — juros %
                <input
                  name={`juros_${n}`}
                  type="number"
                  step="0.01"
                  min={0}
                  value={juros[n] ?? ""}
                  onChange={(e) => atualizarJuros(n, e.target.value)}
                  required
                  className="h-10 rounded-lg border border-border px-2.5 text-sm outline-none focus:border-brand"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {estado?.erro && <p className="text-sm text-red-600">{estado.erro}</p>}
      {estado?.sucesso && <p className="text-sm text-success">Configuração salva.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit inline-flex h-11 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-brand-foreground font-semibold px-6 text-sm transition-colors"
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
