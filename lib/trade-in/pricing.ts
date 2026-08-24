/**
 * Preços-base de referência para o cálculo automático de estimativa de
 * compra de aparelhos usados. São valores de mercado aproximados para um
 * aparelho em condição "excelente" com 64/128GB — o algoritmo ajusta a
 * partir daí conforme as respostas do formulário.
 *
 * Ajuste esses valores livremente conforme o mercado mudar — não precisa
 * mexer em mais nada do código para atualizar os preços.
 */
export const BASE_PRICES_CENTS: Record<string, number> = {
  "apple|iphone 11": 90000,
  "apple|iphone 11 pro max": 140000,
  "apple|iphone 12": 130000,
  "apple|iphone 12 mini": 100000,
  "apple|iphone 12 pro": 160000,
  "apple|iphone 12 pro max": 190000,
  "apple|iphone 13": 170000,
  "apple|iphone 13 mini": 130000,
  "apple|iphone 13 pro": 220000,
  "apple|iphone 13 pro max": 260000,
  "apple|iphone 14": 210000,
  "apple|iphone 14 pro": 290000,
  "apple|iphone 14 pro max": 330000,
  "apple|iphone se": 70000,
  "samsung|galaxy s21": 90000,
  "samsung|galaxy s22": 130000,
  "samsung|galaxy s23": 190000,
  "samsung|galaxy a54": 90000,
  "samsung|galaxy a34": 70000,
  "xiaomi|redmi note": 40000,
  "motorola|moto g": 35000,
};

const DEFAULT_BASE_PRICE_CENTS = 30000;
const STORAGE_STEP_MULTIPLIER = 0.06; // cada salto de armazenamento (ex: 128→256GB) soma ~6%

export function buscarPrecoBase(brand: string, model: string): { valorCents: number; encontrado: boolean } {
  const chave = `${brand.trim().toLowerCase()}|${model.trim().toLowerCase()}`;
  const valor = BASE_PRICES_CENTS[chave];
  return valor !== undefined ? { valorCents: valor, encontrado: true } : { valorCents: DEFAULT_BASE_PRICE_CENTS, encontrado: false };
}

export type RespostasEstimativa = {
  brand: string;
  model: string;
  storageGb?: number;
  screenCondition: "perfeita" | "riscos_leves" | "trincada";
  bodyCondition: "perfeito" | "riscos_leves" | "amassado";
  batteryHealth: "acima_90" | "entre_80_89" | "abaixo_80" | "nao_sei";
  turnsOn: boolean;
  brokenParts: string[];
  replacedParts: string[];
};

const MULT_TELA: Record<RespostasEstimativa["screenCondition"], number> = {
  perfeita: 1,
  riscos_leves: 0.9,
  trincada: 0.55,
};

const MULT_CARCACA: Record<RespostasEstimativa["bodyCondition"], number> = {
  perfeito: 1,
  riscos_leves: 0.93,
  amassado: 0.8,
};

const MULT_BATERIA: Record<RespostasEstimativa["batteryHealth"], number> = {
  acima_90: 1,
  entre_80_89: 0.93,
  abaixo_80: 0.82,
  nao_sei: 0.9,
};

const DESCONTO_POR_PECA_QUEBRADA = 0.12; // cada peça quebrada (câmera, alto-falante, etc) tira 12%
const DESCONTO_POR_PECA_TROCADA = 0.05; // peça não original (tela/bateria trocada fora da autorizada) tira 5%

/**
 * Estima o valor de compra com base nas respostas do formulário. O
 * resultado é sempre uma ESTIMATIVA — o valor final é confirmado depois
 * que a equipe recebe e inspeciona o aparelho fisicamente (mesmo modelo
 * usado pela Trocafone: valor "até R$X", confirmado na prática depois).
 */
export function calcularEstimativa(respostas: RespostasEstimativa): {
  valorEstimadoCents: number;
  precoBaseEncontrado: boolean;
} {
  const { valorCents: base, encontrado } = buscarPrecoBase(respostas.brand, respostas.model);

  let valor = base;

  if (respostas.storageGb) {
    if (respostas.storageGb >= 512) valor *= 1 + STORAGE_STEP_MULTIPLIER * 3;
    else if (respostas.storageGb >= 256) valor *= 1 + STORAGE_STEP_MULTIPLIER * 2;
    else if (respostas.storageGb >= 128) valor *= 1 + STORAGE_STEP_MULTIPLIER;
  }

  valor *= MULT_TELA[respostas.screenCondition];
  valor *= MULT_CARCACA[respostas.bodyCondition];
  valor *= MULT_BATERIA[respostas.batteryHealth];

  if (!respostas.turnsOn) {
    // Aparelho que não liga vale só como peça — corte drástico.
    valor *= 0.25;
  }

  valor *= Math.max(0, 1 - respostas.brokenParts.length * DESCONTO_POR_PECA_QUEBRADA);
  valor *= Math.max(0, 1 - respostas.replacedParts.length * DESCONTO_POR_PECA_TROCADA);

  return {
    valorEstimadoCents: Math.max(0, Math.round(valor / 100) * 100),
    precoBaseEncontrado: encontrado,
  };
}
