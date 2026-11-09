import { NextRequest, NextResponse } from "next/server";
import { cotarFreteDoCarrinho } from "@/lib/shipping/cotacao";
import { CartItem } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { cep: string; items: CartItem[] } | null;

  if (!body?.cep || !body.items?.length) {
    return NextResponse.json({ error: "CEP e itens são obrigatórios." }, { status: 400 });
  }

  const cotacao = await cotarFreteDoCarrinho(body.cep, body.items);
  if (!cotacao.ok) {
    return NextResponse.json({ error: cotacao.error }, { status: cotacao.status });
  }

  return NextResponse.json({
    opcoes: cotacao.opcoes,
    freteGratis: cotacao.freteGratis,
    freteFixo: cotacao.freteFixo,
    avisoFrete: cotacao.avisoFrete,
  });
}
