import { ProductCondition } from "./types";

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  novo: "Novo",
  excelente: "Excelente",
  "muito-bom": "Muito Bom",
  bom: "Bom",
  outlet: "Outlet",
};

/** Ordering used whenever grading tiers are shown side by side (best to most affordable). */
export const CONDITION_ORDER: ProductCondition[] = ["excelente", "muito-bom", "bom", "outlet", "novo"];

/** Texto usado no acordeão "Entender condições" da página de produto (ProductDetail). */
export const CONDITION_DETAILS: Record<ProductCondition, { tela: string; lateral: string; traseira: string; bateria: string; acessorios: string }> = {
  novo: {
    tela: "Lacrada de fábrica, sem nenhum uso.",
    lateral: "Sem marcas de uso.",
    traseira: "Sem arranhões.",
    bateria: "100% da capacidade original.",
    acessorios: "Acompanha todos os acessórios originais de fábrica.",
  },
  excelente: {
    tela: "Sem riscos visíveis — estado de aparelho novo.",
    lateral: "Sem amassados ou marcas de uso.",
    traseira: "Sem arranhões visíveis.",
    bateria: "Mínimo de 85% da capacidade original.",
    acessorios: "Acompanha cabo de carregamento.",
  },
  "muito-bom": {
    tela: "Pode ter riscos bem leves, perceptíveis só de perto.",
    lateral: "Pequenas marcas de uso, sem amassados.",
    traseira: "Pode ter arranhões leves.",
    bateria: "Mínimo de 85% da capacidade original.",
    acessorios: "Acompanha cabo de carregamento.",
  },
  bom: {
    tela: "Riscos visíveis de uso normal, sem afetar o funcionamento.",
    lateral: "Pode apresentar pequenos amassados.",
    traseira: "Pode ter arranhões visíveis.",
    bateria: "Mínimo de 80% da capacidade original.",
    acessorios: "Não acompanha acessórios.",
  },
  outlet: {
    tela: "Sinais mais evidentes de uso, como riscos.",
    lateral: "Pode apresentar amassados leves.",
    traseira: "Pode ter arranhões e marcas de uso mais evidentes.",
    bateria: "Mínimo de 80% da capacidade original.",
    acessorios: "Não acompanha acessórios.",
  },
};

export function isSeminovo(condition: ProductCondition) {
  return condition !== "novo";
}

export function sortByCondition(conditions: ProductCondition[]) {
  return [...conditions].sort((a, b) => CONDITION_ORDER.indexOf(a) - CONDITION_ORDER.indexOf(b));
}
