import { NextRequest, NextResponse } from "next/server";
import { calcularFrete, dimensoesDaVariante, MelhorEnvioApiError } from "@/lib/melhor-envio/client";
import { products } from "@/lib/data/products";
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

  const itens = body.items.map((item) => {
    const produto = products.find((p) => p.id === item.productId);
    const variante = produto?.variants.find((v) => v.id === item.variantId);
    const dimensoes = dimensoesDaVariante(variante ?? {});
    return {
      nome: produto?.name ?? "Produto",
      quantidade: item.quantity,
      valorUnitarioCents: variante?.priceCents ?? 0,
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