import { NextRequest, NextResponse } from "next/server";
import { calcularFrete, dimensoesDaVariante, MelhorEnvioApiError } from "@/lib/melhor-envio/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { CartItem } from "@/lib/types";

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
  const variantIds = body.items.map((i) => i.variantId);

  const { data: variantes, error: erroVariantes } = await supabase
    .from("product_variants")
    .select("id, price_cents, weight_grams, width_cm, height_cm, length_cm, products ( name )")
    .in("id", variantIds);

  if (erroVariantes) {
    console.error("[frete] falha ao buscar variantes:", erroVariantes.message);
    return NextResponse.json({ error: "Não foi possível calcular o frete agora." }, { status: 502 });
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
      nome: (Array.isArray(variante?.products) ? variante.products[0]?.name : (variante?.products as { name: string } | undefined)?.name) ?? "Produto",
      quantidade: item.quantity,
      valorUnitarioCents: variante?.price_cents ?? 0,
      ...dimensoes,
    };
  });

  try {
    const opcoes = await calcularFrete(cepLimpo, itens);
    if (opcoes.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma transportadora atende esse CEP no momento. Confira se o CEP está correto." },
        { status: 404 }
      );
    }
    return NextResponse.json({ opcoes });
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
