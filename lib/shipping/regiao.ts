export type Regiao = "norte" | "nordeste" | "centro-oeste" | "sudeste" | "sul";

export const NOME_REGIAO: Record<Regiao, string> = {
  norte: "Norte",
  nordeste: "Nordeste",
  "centro-oeste": "Centro-Oeste",
  sudeste: "Sudeste",
  sul: "Sul",
};

/**
 * Faixas de CEP dos Correios (5 primeiros dígitos) agrupadas por região.
 * Cada faixa é [inicio, fim] inclusivo; RO e TO ficam dentro do bloco 76xxx/77xxx
 * que o intervalo do Centro-Oeste (GO) atravessa, por isso aparecem antes.
 */
const FAIXAS: Array<[number, number, Regiao]> = [
  [1000, 39999, "sudeste"], // SP, RJ, ES, MG
  [40000, 65999, "nordeste"], // BA, SE, PE, AL, PB, RN, CE, PI, MA
  [66000, 69999, "norte"], // PA, AP, AM, RR, AC
  [76800, 76999, "norte"], // RO
  [77000, 77999, "norte"], // TO
  [70000, 76799, "centro-oeste"], // DF, GO
  [78000, 79999, "centro-oeste"], // MT, MS
  [80000, 99999, "sul"], // PR, SC, RS
];

/** Região de destino a partir do CEP, ou null se o CEP estiver fora de qualquer faixa. */
export function regiaoPorCep(cep: string): Regiao | null {
  const digitos = cep.replace(/\D/g, "");
  if (digitos.length !== 8) return null;

  const prefixo = Number(digitos.slice(0, 5));
  const faixa = FAIXAS.find(([inicio, fim]) => prefixo >= inicio && prefixo <= fim);
  return faixa ? faixa[2] : null;
}
