import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mpPreference } from "@/lib/mercadopago/client";
import { products } from "@/lib/data/products";
import { CartItem } from "@/lib/types";
import { getPixPriceCents, calculateInstallment, formatBRL } from "@/lib/pricing";

interface CriarPagamentoBody {
  items: CartItem[];
  paymentMethod: "pix" | "boleto" | "cartao";
  installments?: number;
  customerName: string;
  cpf: string;
  phone: string;
  address: { cep: string; street: string; city: string; state: string };
  frete?: { valorCentavos: number; nome: string; servicoId: number; prazoDias: number };
}

function resolverItem(item: CartItem) {
  const produto = products.find((p) => p.id === item.productId);
  const variante = produto?.variants.find((v) => v.id === item.variantId);
  return { produto, variante };
}

/**
 * Cria o pedido em `orders` (Supabase) e a preferência de pagamento no
 * Mercado Pago. O catálogo ainda é o mock local (`lib/data/products.ts`),
 * então os itens são gravados como snapshot em `orders.items` (jsonb) em
 * vez de linhas relacionais em `order_items`.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CriarPagamentoBody | null;

  if (!body?.items?.length || !body.customerName || !body.address?.cep) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "É preciso estar logado para finalizar a compra." }, { status: 401 });
  }

  const itensResolvidos = body.items.map((item) => {
    const { produto, variante } = resolverItem(item);
    return { item, produto, variante };
  });

  if (itensResolvidos.some(({ produto, variante }) => !produto || !variante)) {
    return NextResponse.json({ error: "Um ou mais itens do carrinho não foram encontrados." }, { status: 400 });
  }

  const subtotalCents = itensResolvidos.reduce(
    (soma, { variante, item }) => soma + variante!.priceCents * item.quantity,
    0
  );
  const freteCents = body.frete?.valorCentavos ?? 0;

  let totalCents = subtotalCents + freteCents;
  let parcelas = 1;

  if (body.paymentMethod === "pix") {
    totalCents = getPixPriceCents(subtotalCents) + freteCents;
  } else if (body.paymentMethod === "cartao") {
    const resultado = calculateInstallment(subtotalCents, body.installments ?? 1);
    totalCents = resultado.totalCents + freteCents;
    parcelas = body.installments ?? 1;
  }

  const itemsSnapshot = itensResolvidos.map(({ item, produto, variante }) => ({
    productId: item.productId,
    variantId: item.variantId,
    nome: produto!.name,
    cor: variante!.color,
    armazenamento: variante!.storageGb ?? null,
    quantidade: item.quantity,
    precoUnitarioCents: variante!.priceCents,
    imagem: variante!.photos?.[0] ?? variante!.images?.[0] ?? null,
  }));

  const { data: pedido, error: erroPedido } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      subtotal: subtotalCents / 100,
      desconto: (subtotalCents + freteCents - totalCents > 0 ? subtotalCents + freteCents - totalCents : 0) / 100,
      total: totalCents / 100,
      parcelas,
      metodo_pagamento: body.paymentMethod,
      items: itemsSnapshot,
      endereco_entrega: {
        ...body.address,
        nome: body.customerName,
        documento: body.cpf,
        telefone: body.phone,
        frete_nome: body.frete?.nome ?? null,
        frete_servico_id: body.frete?.servicoId ?? null,
        frete_prazo_dias: body.frete?.prazoDias ?? null,
      },
    })
    .select("id")
    .single();

  if (erroPedido || !pedido) {
    console.error("[mercadopago:criar-pagamento] falha ao criar pedido:", erroPedido?.message);
    return NextResponse.json({ error: "Não foi possível criar o pedido." }, { status: 500 });
  }

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    event_type: "order_created",
    metadata: { pedidoId: pedido.id, totalCents },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const preferencia = await mpPreference.create({
    body: {
      items: [
        ...itemsSnapshot.map((item) => ({
          id: item.variantId,
          title: `${item.nome}${item.cor ? ` — ${item.cor}` : ""}`,
          quantity: item.quantidade,
          unit_price: item.precoUnitarioCents / 100,
          currency_id: "BRL",
        })),
        ...(freteCents > 0
          ? [
              {
                id: "frete",
                title: `Frete — ${body.frete?.nome ?? "Envio"}`,
                quantity: 1,
                unit_price: freteCents / 100,
                currency_id: "BRL",
              },
            ]
          : []),
      ],
      payer: { email: user.email, name: body.customerName },
      external_reference: pedido.id,
      back_urls: {
        success: `${siteUrl}/pedido/confirmacao?id=${pedido.id}`,
        pending: `${siteUrl}/pedido/confirmacao?id=${pedido.id}&status=pending`,
        failure: `${siteUrl}/checkout?erro=pagamento_recusado`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
      statement_descriptor: "BRASILMULTITECH",
    },
  });

  // Update via client admin: não há policy de UPDATE para "dono do pedido" em
  // orders (só para admin), de propósito — mp_preference_id é campo de
  // sistema, não algo que o comprador deveria poder escrever diretamente.
  await createAdminClient().from("orders").update({ mp_preference_id: preferencia.id }).eq("id", pedido.id);


  const initPoint =
    process.env.NODE_ENV === "production" ? preferencia.init_point : preferencia.sandbox_init_point;

  return NextResponse.json({
    orderId: pedido.id,
    initPoint,
    totalFormatado: formatBRL(totalCents),
  });
}
