"use client";

import { useActionState } from "react";

type EstadoEtiqueta = { erro?: string; sucesso?: boolean } | null;

export function GerarEtiquetaButton({
  action,
}: {
  action: (estado: EstadoEtiqueta, formData: FormData) => Promise<EstadoEtiqueta>;
}) {
  const [estado, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction}>
      <p className="text-sm text-muted mb-3">
        Pedido pago, ainda sem etiqueta gerada. Isso vai debitar da carteira Melhor Envio.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-60 px-4 text-sm font-semibold text-brand-foreground transition-colors"
      >
        {pending ? "Gerando…" : "Gerar etiqueta de envio"}
      </button>

      {estado?.erro && <p className="mt-2 text-sm text-red-600">{estado.erro}</p>}
      {estado?.sucesso && <p className="mt-2 text-sm text-success">Etiqueta gerada com sucesso!</p>}
    </form>
  );
}
