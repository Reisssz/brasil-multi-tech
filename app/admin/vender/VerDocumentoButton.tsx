"use client";

import { useState } from "react";
import { gerarUrlDocumento } from "./actions";

export function VerDocumentoButton({ solicitacaoId }: { solicitacaoId: string }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function abrirDocumento() {
    setErro(null);
    setCarregando(true);
    try {
      const resultado = await gerarUrlDocumento(solicitacaoId);
      if (resultado.error || !resultado.url) {
        setErro(resultado.error ?? "Não foi possível abrir o documento.");
        return;
      }
      window.open(resultado.url, "_blank", "noopener,noreferrer");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={abrirDocumento}
        disabled={carregando}
        className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-[#f7f8fa] transition-colors disabled:opacity-60"
      >
        {carregando ? "Abrindo…" : "Ver documento"}
      </button>
      {erro && <span className="text-[11px] text-red-600">{erro}</span>}
    </div>
  );
}
