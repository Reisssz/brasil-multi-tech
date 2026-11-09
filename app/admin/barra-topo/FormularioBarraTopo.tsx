"use client";

import { useActionState } from "react";
import { atualizarBarraTopo } from "./actions";
import type { ConfiguracaoBarraTopo } from "@/lib/promo-bar";

const CLASSE_INPUT = "h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand";

export function FormularioBarraTopo({ config }: { config: ConfiguracaoBarraTopo }) {
  const [estado, formAction, pending] = useActionState(atualizarBarraTopo, null);

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <label className="flex items-center gap-3 text-sm font-medium text-foreground">
        <input type="checkbox" name="ativo" defaultChecked={config.ativo} className="h-4 w-4 accent-[color:var(--brand)]" />
        Exibir a barra no topo do site
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Mensagens que se alternam (uma por linha)
        <textarea
          name="mensagens"
          rows={6}
          defaultValue={config.mensagens.join("\n")}
          className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand resize-y"
        />
        <span className="text-xs font-normal text-muted">
          Use {"{parcelas}"} para inserir automaticamente o máximo de parcelas sem juros. Até 10 mensagens de 120
          caracteres.
        </span>
      </label>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Texto fixo à esquerda
          <input name="rotulo" defaultValue={config.rotulo} maxLength={40} placeholder="Opcional" className={CLASSE_INPUT} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Texto do botão
          <input name="ctaTexto" defaultValue={config.ctaTexto} maxLength={30} placeholder="Opcional" className={CLASSE_INPUT} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Link da barra
          <input name="ctaHref" defaultValue={config.ctaHref} placeholder="/categoria/ofertas" className={CLASSE_INPUT} />
        </label>
      </div>

      {estado?.erro && <p className="text-sm text-red-600">{estado.erro}</p>}
      {estado?.sucesso && <p className="text-sm text-success">Barra do topo salva.</p>}

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
