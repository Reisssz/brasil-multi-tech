"use client";

import { useActionState } from "react";

type EstadoRastreio = { erro?: string; sucesso?: boolean } | null;

const CLASSE_INPUT = "h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand";

export function RastreioManualForm({
  action,
  codigoAtual,
  urlAtual,
}: {
  action: (estado: EstadoRastreio, formData: FormData) => Promise<EstadoRastreio>;
  codigoAtual?: string | null;
  urlAtual?: string | null;
}) {
  const [estado, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Código de rastreio
          <input name="codigo" defaultValue={codigoAtual ?? ""} required placeholder="Ex: AA123456789BR" className={CLASSE_INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Link de rastreio (opcional)
          <input name="url" type="url" defaultValue={urlAtual ?? ""} placeholder="https://…" className={CLASSE_INPUT} />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-fit inline-flex h-10 items-center justify-center rounded-lg border border-border hover:border-brand disabled:opacity-60 px-4 text-sm font-semibold text-foreground transition-colors"
      >
        {pending ? "Salvando…" : "Salvar código de rastreio"}
      </button>

      {estado?.erro && <p className="text-sm text-red-600">{estado.erro}</p>}
      {estado?.sucesso && <p className="text-sm text-success">Código de rastreio salvo.</p>}
    </form>
  );
}
