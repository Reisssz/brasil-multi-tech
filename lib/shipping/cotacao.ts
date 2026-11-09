import { createAdminClient } from "@/lib/supabase/admin";
import { getConfiguracaoFreteFixo } from "@/lib/data/shipping-settings";
import {
  calcularFrete,
  dimensoesDaVariante,
  ItemParaFrete,
  MelhorEnvioApiError,
  MelhorEnvioTlsError,
  OpcaoFrete,
} from "@/lib/melhor-envio/client";
import { SITE } from "@/lib/config";
import { CartItem } from "@/lib/types";
import { regiaoPorCep } from "./regiao";

/** Id sintético da opção de frete fixo (não existe no Melhor Envio). */
export const FRETE_FIXO_ID = 0;
/** Serviço usado para gerar a etiqueta de pedidos com frete fixo (PAC, o mais barato). */
export const SERVICO_ETIQUETA_FRETE_FIXO = 1;

// Mesmo id usado em lib/melhor-envio/client.ts para pedir o serviço SEDEX.
const SERVICO_GRATIS_ID = 2;
const SERVICO_GRATIS_NOME = "SEDEX";
const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ResultadoCotacao =
  | {
      ok: true;
      opcoes: OpcaoFrete[];
      freteGratis: boolean;
      freteFixo: boolean;
      avisoFrete: string | null;
      /** Itens com peso/dimensões efetivamente usados na cotação, na ordem de `items`. */
      itens: ItemParaFrete[];
    }
  | { ok: false; status: number; error: string };

type VarianteComProduto = {
  id: string;
  price_cents: number;
  weight_grams: number | null;
  width_cm: number | null;
  height_cm: number | null;
  length_cm: number | null;
  products: { name: string; free_shipping: boolean } | { name: string; free_shipping: boolean }[] | null;
};

function produtoDaVariante(v: VarianteComProduto | undefined) {
  if (!v) return undefined;
  return Array.isArray(v.products) ? v.products[0] : (v.products ?? undefined);
}

/**
 * Cotação de frete única para o site inteiro (estimador, checkout e criação
 * do pedido). Sul/Sudeste com frete fixo ativo usam o valor do admin; as
 * demais regiões usam o Melhor Envio. Peso, dimensões e preço sempre vêm do
 * banco — nunca do navegador.
 */
export async function cotarFreteDoCarrinho(cep: string, items: CartItem[]): Promise<ResultadoCotacao> {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) {
    return { ok: false, status: 400, error: "Esse CEP parece incompleto. Digite os 8 números, sem espaços ou traço." };
  }

  const variantIds = items.map((i) => i.variantId);
  const idsInvalidos = variantIds.filter((id) => !REGEX_UUID.test(id));
  if (idsInvalidos.length > 0) {
    // Carrinho salvo no navegador de antes da migração do catálogo (ids não-UUID).
    console.warn("[frete] itens de carrinho com id inválido (provável carrinho desatualizado):", idsInvalidos);
    return {
      ok: false,
      status: 409,
      error: "Seu carrinho tem um item desatualizado. Remova-o e adicione o produto novamente.",
    };
  }

  const supabase = createAdminClient();
  const { data: variantes, error: erroVariantes } = await supabase
    .from("product_variants")
    .select("id, price_cents, weight_grams, width_cm, height_cm, length_cm, products ( name, free_shipping )")
    .in("id", variantIds);

  if (erroVariantes) {
    console.error("[frete] falha ao buscar variantes:", erroVariantes.message);
    return { ok: false, status: 502, error: "Não foi possível calcular o frete agora." };
  }

  const lista = (variantes ?? []) as unknown as VarianteComProduto[];

  const itens: ItemParaFrete[] = items.map((item) => {
    const variante = lista.find((v) => v.id === item.variantId);
    return {
      nome: produtoDaVariante(variante)?.name ?? "Produto",
      quantidade: item.quantity,
      valorUnitarioCents: variante?.price_cents ?? 0,
      ...dimensoesDaVariante({
        weightGrams: variante?.weight_grams,
        widthCm: variante?.width_cm,
        heightCm: variante?.height_cm,
        lengthCm: variante?.length_cm,
      }),
    };
  });

  const regiao = regiaoPorCep(cepLimpo);
  const configFixo = await getConfiguracaoFreteFixo();

  if (configFixo.ativo && (regiao === "sul" || regiao === "sudeste")) {
    const valorCents = regiao === "sul" ? configFixo.sulCents : configFixo.sudesteCents;
    return {
      ok: true,
      freteFixo: true,
      freteGratis: false,
      avisoFrete: null,
      itens,
      opcoes: [
        {
          id: FRETE_FIXO_ID,
          nome: "Frete fixo",
          transportadora: SITE.name,
          precoOriginalCents: valorCents,
          precoComDescontoCents: valorCents,
          prazoDias: configFixo.prazoDias,
          fixo: true,
        },
      ],
    };
  }

  // Frete grátis só se TODOS os itens do carrinho tiverem free_shipping — um
  // pacote com item pago dentro continua cobrando o frete do pacote inteiro.
  const todosComFreteGratis = items.every((item) => {
    const variante = lista.find((v) => v.id === item.variantId);
    return produtoDaVariante(variante)?.free_shipping === true;
  });

  try {
    const { opcoes, descartados } = await calcularFrete(cepLimpo, itens);
    if (opcoes.length === 0) {
      return {
        ok: false,
        status: 404,
        error: "Nenhuma transportadora atende esse CEP no momento. Confira se o CEP está correto.",
      };
    }

    // PAC (id 1) costuma ser descartado pelos Correios quando o destino é
    // perto demais; sem este aviso o cliente via o PAC sumir sem entender.
    const avisoFrete = descartados.some((s) => s.id === 1)
      ? "O PAC não está disponível para o endereço informado: a transportadora não atende envios econômicos para distâncias tão curtas. Para esse trecho, só o SEDEX é oferecido."
      : null;

    const base = { ok: true as const, freteFixo: false, avisoFrete, itens };

    if (!todosComFreteGratis) return { ...base, opcoes, freteGratis: false };

    // Política da loja: frete grátis vale só pelo SEDEX; os demais serviços
    // continuam cobrando o valor real.
    const indiceGratis = opcoes.findIndex(
      (o) => o.id === SERVICO_GRATIS_ID || o.nome.toUpperCase().includes(SERVICO_GRATIS_NOME)
    );

    if (indiceGratis === -1) {
      console.warn(
        `[frete] frete grátis esperado mas ${SERVICO_GRATIS_NOME} não veio nas opções retornadas. Opções recebidas:`,
        opcoes.map((o) => o.nome).join(", ")
      );
      return { ...base, opcoes, freteGratis: false };
    }

    const opcoesComGratis = opcoes.map((o, i) => (i === indiceGratis ? { ...o, precoComDescontoCents: 0 } : o));
    // Opção grátis sempre primeiro na lista, pra já vir pré-selecionada.
    const ordenadas = [opcoesComGratis[indiceGratis], ...opcoesComGratis.filter((_, i) => i !== indiceGratis)];
    return { ...base, opcoes: ordenadas, freteGratis: true };
  } catch (erro) {
    if (erro instanceof MelhorEnvioTlsError) {
      console.error("[frete] certificado TLS expirado na cadeia de confiança da rede.");
      return {
        ok: false,
        status: 502,
        error: "A conexão segura com a transportadora está temporariamente indisponível. Tente novamente mais tarde.",
      };
    }

    if (erro instanceof MelhorEnvioApiError) {
      // CEP inexistente é o único erro que é culpa do cliente (400); o resto é configuração da loja.
      if (erro.errors?.["to.postal_code"] || erro.errors?.postal_code_to) {
        return {
          ok: false,
          status: 400,
          error: "Não encontramos esse CEP. Confira se digitou certo — ele deve ter 8 números.",
        };
      }
      console.error("[frete] erro de configuração ao cotar:", erro.status, erro.errors);
      return { ok: false, status: 502, error: erro.mensagemAmigavel() };
    }

    console.error("[frete] falha ao cotar:", erro);
    return { ok: false, status: 502, error: "Não foi possível calcular o frete agora. Tente novamente." };
  }
}
