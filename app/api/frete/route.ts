import { NextRequest, NextResponse } from "next/server";
import { calcularFrete, dimensoesDaVariante, MelhorEnvioApiError } from "@/lib/melhor-envio/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { CartItem } from "@/lib/types";

// Mesmo id usado em lib/melhor-envio/client.ts para pedir o serviço SEDEX.
const SERVICO_GRATIS_ID = 2;
const SERVICO_GRATIS_NOME = "SEDEX";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { cep: string; items: CartItem[] } | null;

  if (!body?.cep || !body.items?.length) {
    return NextResponse.json({ error: "CEP e itens são obrigatórios." }, { status: 400 });
  }

  const cepLimpo = body.cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) {
    return NextResponse.json(
      { error: "Esse CEP parece incompleto. Digite os 8 números, sem espaços ou traço." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const variantIds = body.items.map((i) => i.variantId);
  const idsInvalidos = variantIds.filter((id) => !REGEX_UUID.test(id));

  if (idsInvalidos.length > 0) {
    // Item de carrinho salvo no navegador de antes da migração do catálogo
    // pro banco (ids antigos tipo "v-iphone13-..." em vez de UUID) — sem
    // essa checagem, a consulta ao banco quebra com um erro de SQL cru.
    console.warn("[frete] itens de carrinho com id inválido (provável carrinho desatualizado):", idsInvalidos);
    return NextResponse.json(
      { error: "Seu carrinho tem um item desatualizado. Remova-o e adicione o produto novamente." },
      { status: 409 }
    );
  }

  const { data: variantes, error: erroVariantes } = await supabase
    .from("product_variants")
    .select("id, price_cents, weight_grams, width_cm, height_cm, length_cm, products ( name, free_shipping )")
    .in("id", variantIds);

  if (erroVariantes) {
    console.error("[frete] falha ao buscar variantes:", erroVariantes.message);
    return NextResponse.json({ error: "Não foi possível calcular o frete agora." }, { status: 502 });
  }

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

  const itens = body.items.map((item) => {
    const variante = variantes?.find((v) => v.id === item.variantId);
    const dimensoes = dimensoesDaVariante({
      weightGrams: variante?.weight_grams,
      widthCm: variante?.width_cm,
      heightCm: variante?.height_cm,
      lengthCm: variante?.length_cm,
    });
    return {
      nome: produtoDaVariante(variante)?.name ?? "Produto",
      quantidade: item.quantity,
      valorUnitarioCents: variante?.price_cents ?? 0,
      ...dimensoes,
    };
  });

  // Frete grátis só se TODOS os itens do carrinho tiverem free_shipping — um
  // pacote com item pago dentro continua cobrando o frete do pacote inteiro.
  const todosComFreteGratis = body.items.every((item) => {
    const variante = variantes?.find((v) => v.id === item.variantId);
    return produtoDaVariante(variante)?.free_shipping === true;
  });

  try {
    const { opcoes, descartados } = await calcularFrete(cepLimpo, itens);
    if (opcoes.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma transportadora atende esse CEP no momento. Confira se o CEP está correto." },
        { status: 404 }
      );
    }

    // PAC (id 1) costuma ser descartado pelos Correios quando a distância até
    // o destino é curta demais para o serviço econômico — nesses casos só o
    // SEDEX é oferecido. Sem esse aviso, o cliente só via o PAC sumir da
    // lista sem entender o motivo.
    const pacDescartado = descartados.find((s) => s.id === 1);
    const avisoFrete = pacDescartado
      ? `O PAC não está disponível para o endereço informado: a transportadora não atende envios econômicos para distâncias tão curtas. Para esse trecho, só o SEDEX é oferecido.`
      : null;

    if (todosComFreteGratis) {
      // A política da loja é: frete grátis vale só pelo SEDEX — qualquer
      // outro serviço (incluindo PAC) continua cobrando o valor real,
      // mesmo em produtos com frete grátis.
      const indiceGratis = opcoes.findIndex(
        (o) => o.id === SERVICO_GRATIS_ID || o.nome.toUpperCase().includes(SERVICO_GRATIS_NOME)
      );

      if (indiceGratis === -1) {
        // SEDEX não veio disponível pra esse CEP/conta. Não inventamos
        // gratuidade em outro serviço; mostramos os preços reais e
        // avisamos no log pra investigar a causa.
        console.warn(
          `[frete] frete grátis esperado mas ${SERVICO_GRATIS_NOME} não veio nas opções retornadas. Opções recebidas:`,
          opcoes.map((o) => o.nome).join(", ")
        );
        return NextResponse.json({ opcoes, freteGratis: false, avisoFrete });
      }

      const opcoesComGratis = opcoes.map((o, i) => (i === indiceGratis ? { ...o, precoComDescontoCents: 0 } : o));
      // Opção grátis sempre primeiro na lista, pra já vir pré-selecionada.
      const ordenadas = [opcoesComGratis[indiceGratis], ...opcoesComGratis.filter((_, i) => i !== indiceGratis)];

      return NextResponse.json({ opcoes: ordenadas, freteGratis: true, avisoFrete });
    }

    return NextResponse.json({ opcoes, avisoFrete });
  } catch (erro) {
    if (erro instanceof MelhorEnvioApiError) {
      // CEP inválido de verdade (não localizado pelos Correios/base do
      // Melhor Envio) é o único caso que devolvemos como erro do CLIENTE
      // (400). Qualquer outro campo inválido é problema de configuração da
      // loja — devolvemos 502 para não sugerir que o cliente errou algo.
      if (erro.errors?.["to.postal_code"] || erro.errors?.postal_code_to) {
        return NextResponse.json(
          { error: "Não encontramos esse CEP. Confira se digitou certo — ele deve ter 8 números." },
          { status: 400 }
        );
      }
      console.error("[frete] erro de configuração ao cotar:", erro.status, erro.errors);
      return NextResponse.json({ error: erro.mensagemAmigavel() }, { status: 502 });
    }

    console.error("[frete] falha ao cotar:", erro);
    return NextResponse.json({ error: "Não foi possível calcular o frete agora. Tente novamente." }, { status: 502 });
  }
}