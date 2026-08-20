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

export function isSeminovo(condition: ProductCondition) {
  return condition !== "novo";
}

export function sortByCondition(conditions: ProductCondition[]) {
  return [...conditions].sort((a, b) => CONDITION_ORDER.indexOf(a) - CONDITION_ORDER.indexOf(b));
}
