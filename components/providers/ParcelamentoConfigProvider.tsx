"use client";

import { createContext, useContext } from "react";
import { CONFIGURACAO_PARCELAMENTO_PADRAO, ConfiguracaoParcelamento } from "@/lib/pricing";

const ParcelamentoConfigContext = createContext<ConfiguracaoParcelamento>(CONFIGURACAO_PARCELAMENTO_PADRAO);

/** Provido uma vez no layout raiz (que busca o valor real do banco) — components client-side em qualquer lugar da árvore leem com useParcelamentoConfig(). */
export function ParcelamentoConfigProvider({
  value,
  children,
}: {
  value: ConfiguracaoParcelamento;
  children: React.ReactNode;
}) {
  return <ParcelamentoConfigContext.Provider value={value}>{children}</ParcelamentoConfigContext.Provider>;
}

export function useParcelamentoConfig() {
  return useContext(ParcelamentoConfigContext);
}
