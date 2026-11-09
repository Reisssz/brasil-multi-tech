"use client";

import { useActionState } from "react";
import { atualizarConfiguracaoFreteFixo } from "./actions";
import type { ConfiguracaoFreteFixo } from "@/lib/shipping/frete-fixo";

function centavosParaCampo(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

const CLASSE_INPUT = "h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand";

export function FormularioFreteFixo({ config }: { config: ConfiguracaoFreteFixo }) {
  const [estado, formAction, pending] = useActionState(atualizarConfiguracaoFreteFixo, null);

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <label className="flex items-center gap-3 text-sm font-medium text-foreground">
        <input type="checkbox" name="ativo" defaultChecked={config.ativo} className="h-4 w-4 accent-[color:var(--brand)]" />
        Ativar frete fixo para Sul e Sudeste
      </label>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Região Sul (R$)
          <input name="sul" inputMode="decimal" defaultValue={centavosParaCampo(config.sulCents)} required className={CLASSE_INPUT} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Região Sudeste (R$)
          <input
            name="sudeste"
            inputMode="decimal"
            defaultValue={centavosParaCampo(config.sudesteCents)}
            required
            className={CLASSE_INPUT}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Prazo (dias úteis)
          <input name="prazoDias" type="number" min={1} max={60} defaultValue={config.prazoDias} required className={CLASSE_INPUT} />
        </label>
      </div>

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
