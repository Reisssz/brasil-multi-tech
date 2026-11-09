import { regiaoPorCep } from "./lib/shipping/regiao.ts";

const casos: [string, string][] = [
  ["01310-100", "sudeste"], ["20040-020", "sudeste"], ["29010-120", "sudeste"], ["30130-010", "sudeste"],
  ["40020-000", "nordeste"], ["50030-230", "nordeste"], ["60175-047", "nordeste"], ["65010-000", "nordeste"],
  ["66013-000", "norte"], ["69010-000", "norte"], ["76801-000", "norte"], ["77001-000", "norte"],
  ["70040-010", "centro-oeste"], ["74000-000", "centro-oeste"], ["78005-000", "centro-oeste"], ["79002-000", "centro-oeste"],
  ["80010-000", "sul"], ["88010-000", "sul"], ["90010-000", "sul"], ["00000-000", "null"],
];
for (const [c, e] of casos) {
  const r = regiaoPorCep(c) ?? "null";
  console.log(r === e ? "OK  " : "ERRO", c, r);
}
