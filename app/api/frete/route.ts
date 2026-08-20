import { NextRequest, NextResponse } from "next/server";
import { calcularFrete, dimensoesDaVariante } from "@/lib/melhor-envio/client";
import { products } from "@/lib/data/products";
import { CartItem } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { cep: string; items: CartItem[] } | null;

  if (!body?.cep || !body.items?.length) {
    return NextResponse.json({ error: "CEP e itens são obrigatórios." }, { status: 400 });
  }

  const cepLimpo = body.cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
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
      return NextResponse.json({ error: "Nenhuma opção de frete disponível para este CEP." }, { status: 404 });
    }
    return NextResponse.json({ opcoes });
  } catch (erro) {
    console.error("[frete] falha ao cotar:", erro);
    return NextResponse.json({ error: "Não foi possível calcular o frete agora." }, { status: 502 });
  }
}
