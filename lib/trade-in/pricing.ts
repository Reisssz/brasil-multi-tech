/**
 * Preços-base de referência para o cálculo automático de estimativa de
 * compra de aparelhos usados. Antes viviam hardcoded aqui — agora vêm da
 * tabela trade_in_base_prices (editável pelo admin em /admin/vender/precos)
 * e chegam como `catalogo`, montado por quem chama estas funções (browser
 * ou servidor) com buildCatalogo(). São valores de mercado aproximados
 * para um aparelho em condição "excelente" com 64/128GB — o algoritmo
 * ajusta a partir daí conforme as respostas do formulário.
 */
export type CatalogoPrecos = Record<string, number>;

export function buildCatalogo(linhas: { brand: string; model: string; valor_cents: number }[]): CatalogoPrecos {
  const catalogo: CatalogoPrecos = {};
  for (const linha of linhas) {
    catalogo[`${linha.brand.trim().toLowerCase()}|${linha.model.trim().toLowerCase()}`] = linha.valor_cents;
  }
  return catalogo;
}

const DEFAULT_BASE_PRICE_CENTS = 30000;
const STORAGE_STEP_MULTIPLIER = 0.06; // cada salto de armazenamento (ex: 128→256GB) soma ~6%

export function buscarPrecoBase(
  brand: string,
  model: string,
  catalogo: CatalogoPrecos
): { valorCents: number; encontrado: boolean } {
  const chave = `${brand.trim().toLowerCase()}|${model.trim().toLowerCase()}`;
  const valor = catalogo[chave];
  return valor !== undefined ? { valorCents: valor, encontrado: true } : { valorCents: DEFAULT_BASE_PRICE_CENTS, encontrado: false };
}

export type SaudeBateria = "superior_90" | "entre_80_90" | "inferior_80";
export type MarcasDeUso = "nenhuma" | "levissimas" | "visiveis";
export type OfferType = "agora" | "mais_valor";

export type RespostasEstimativa = {
  brand: string;
  model: string;
  storageGb?: number;
  turnsOn: boolean;
  fazRecebeLigacoes: boolean;
  wifiBluetoothOk: boolean;
  marcasDeUso: MarcasDeUso;
  traseiraLateralDanificada: boolean;
  telaDanificada: boolean;
  biometriaFunciona: boolean;
  cameraComProblema: boolean;
  saudeBateria: SaudeBateria;
  pecaNaoGenuina: boolean;
  includesBox?: boolean;
  includesCharger?: boolean;
};

const MULT_MARCAS_DE_USO: Record<MarcasDeUso, number> = {
  nenhuma: 1,
  levissimas: 0.93,
  visiveis: 0.8,
};

const MULT_BATERIA: Record<SaudeBateria, number> = {
  superior_90: 1,
  entre_80_90: 0.93,
  inferior_80: 0.82,
};

const PENALIDADE_TRASEIRA_LATERAL = 0.85;
const PENALIDADE_TELA = 0.55;
const PENALIDADE_BIOMETRIA = 0.95;
const PENALIDADE_CAMERA = 0.85;
const PENALIDADE_PECA_NAO_GENUINA = 0.95;
const BONUS_ACESSORIO = 0.02; // caixa e carregador originais somam ~2% cada

const MAIS_VALOR_MULTIPLIER = 1.2; // "Venda Mais Valor": no mínimo 20% a mais

/**
 * Aparelhos nessa condição não são comprados: não ligam, ou ligam mas não
 * fazem/recebem ligação e não têm wifi/bluetooth (ou seja, quase nenhuma
 * função essencial funciona).
 */
export function deveRejeitar(respostas: Pick<RespostasEstimativa, "turnsOn" | "fazRecebeLigacoes" | "wifiBluetoothOk">): boolean {
  if (!respostas.turnsOn) return true;
  if (!respostas.fazRecebeLigacoes && !respostas.wifiBluetoothOk) return true;
  return false;
}

/**
 * Estima o valor de compra com base nas respostas do formulário. O
 * resultado é sempre uma ESTIMATIVA — o valor final é confirmado depois
 * que a equipe recebe e inspeciona o aparelho fisicamente.
 */
export function calcularEstimativa(
  respostas: RespostasEstimativa,
  catalogo: CatalogoPrecos
): {
  valorEstimadoCents: number;
  precoBaseEncontrado: boolean;
} {
  const { valorCents: base, encontrado } = buscarPrecoBase(respostas.brand, respostas.model, catalogo);

  let valor = base;

  if (respostas.storageGb) {
    if (respostas.storageGb >= 512) valor *= 1 + STORAGE_STEP_MULTIPLIER * 3;
    else if (respostas.storageGb >= 256) valor *= 1 + STORAGE_STEP_MULTIPLIER * 2;
    else if (respostas.storageGb >= 128) valor *= 1 + STORAGE_STEP_MULTIPLIER;
  }

  if (deveRejeitar(respostas)) {
    return { valorEstimadoCents: 0, precoBaseEncontrado: encontrado };
  }

  valor *= MULT_MARCAS_DE_USO[respostas.marcasDeUso];
  valor *= MULT_BATERIA[respostas.saudeBateria];

  if (respostas.traseiraLateralDanificada) valor *= PENALIDADE_TRASEIRA_LATERAL;
  if (respostas.telaDanificada) valor *= PENALIDADE_TELA;
  if (!respostas.biometriaFunciona) valor *= PENALIDADE_BIOMETRIA;
  if (respostas.cameraComProblema) valor *= PENALIDADE_CAMERA;
  if (respostas.pecaNaoGenuina) valor *= PENALIDADE_PECA_NAO_GENUINA;

  if (respostas.includesBox) valor *= 1 + BONUS_ACESSORIO;
  if (respostas.includesCharger) valor *= 1 + BONUS_ACESSORIO;

  return {
    valorEstimadoCents: Math.max(0, Math.round(valor / 100) * 100),
    precoBaseEncontrado: encontrado,
  };
}

/** Os dois valores mostrados lado a lado na etapa "Oferta". */
export function calcularOfertas(
  respostas: RespostasEstimativa,
  catalogo: CatalogoPrecos
): {
  agoraCents: number;
  maisValorCents: number;
  precoBaseEncontrado: boolean;
} {
  const { valorEstimadoCents, precoBaseEncontrado } = calcularEstimativa(respostas, catalogo);
  return {
    agoraCents: valorEstimadoCents,
    maisValorCents: Math.round((valorEstimadoCents * MAIS_VALOR_MULTIPLIER) / 100) * 100,
    precoBaseEncontrado,
  };
}
