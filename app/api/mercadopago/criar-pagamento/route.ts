import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mpPreference } from "@/lib/mercadopago/client";
import { CartItem } from "@/lib/types";
import { getPixPriceCents, calculateInstallment, formatBRL } from "@/lib/pricing";

interface CriarPagamentoBody {
  items: CartItem[];
  paymentMethod: "pix" | "boleto" | "cartao";
  installments?: number;
  customerName: string;
  cpf: string;
  phone: string;
  address: { cep: string; street: string; numero: string; complemento?: string; city: string; state: string };
  frete?: { valorCentavos: number; nome: string; servicoId: number; prazoDias: number };
}

type VarianteBanco = {
  id: string;
  color: string | null;
  storage_gb: number | null;
  price_cents: number;
  stock: number;
  photos: string[];
  product_id: string;
  products: { name: string } | null;
};

/**
 * Busca produto/variante e preço DIRETO NO BANCO — nunca confiamos em preço
 * que o navegador manda. Se alguém adulterar a requisição pra tentar pagar
 * menos, o valor cobrado continua sendo o real, lido aqui.
 */
async function resolverItens(supabase: ReturnType<typeof createAdminClient>, items: CartItem[]) {
  const variantIds = items.map((i) => i.variantId);
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, color, storage_gb, price_cents, stock, photos, product_id, products ( name )")
    .in("id", variantIds);

  if (error) {
    console.error("[mercadopago:criar-pagamento] falha ao buscar variantes:", error.message);
    return null;
  }
  return data as unknown as VarianteBanco[];
}

/**
 * Cria o pedido em `orders` (Supabase) e a preferência de pagamento no
 * Mercado Pago. Preço e disponibilidade são sempre lidos do banco no
 * momento da compra — o snapshot vai pra `orders.items` (jsonb) pra manter
 * histórico do que foi comprado mesmo se o produto mudar depois.
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

  const adminClient = createAdminClient();
  const variantes = await resolverItens(adminClient, body.items);

  if (!variantes) {
    return NextResponse.json({ error: "Não foi possível verificar os produtos do carrinho." }, { status: 502 });
  }

  const itensResolvidos = body.items.map((item) => ({
    item,
    variante: variantes.find((v) => v.id === item.variantId),
  }));

  if (itensResolvidos.some(({ variante }) => !variante)) {
    return NextResponse.json(
      { error: "Um ou mais itens do carrinho não existem mais. Atualize seu carrinho e tente de novo." },
      { status: 400 }
    );
  }

  const semEstoque = itensResolvidos.find(({ variante, item }) => variante!.stock < item.quantity);
  if (semEstoque) {
    return NextResponse.json(
      {
        error: `"${semEstoque.variante!.products?.name}" não tem mais estoque suficiente (disponível: ${semEstoque.variante!.stock}). Ajuste a quantidade no carrinho.`,
      },
      { status: 409 }
    );
  }

  const subtotalCents = itensResolvidos.reduce(
    (soma, { variante, item }) => soma + variante!.price_cents * item.quantity,
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

  const itemsSnapshot = itensResolvidos.map(({ item, variante }) => ({
    productId: variante!.product_id,
    variantId: item.variantId,
    nome: variante!.products?.name ?? "Produto",
    cor: variante!.color,
    armazenamento: variante!.storage_gb,
    quantidade: item.quantity,
    precoUnitarioCents: variante!.price_cents,
    imagem: variante!.photos?.[0] ?? null,
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
  await adminClient.from("orders").update({ mp_preference_id: preferencia.id }).eq("id", pedido.id);


  const initPoint =
    process.env.NODE_ENV === "production" ? preferencia.init_point : preferencia.sandbox_init_point;

  return NextResponse.json({
    orderId: pedido.id,
    initPoint,
    totalFormatado: formatBRL(totalCents),
  });
}
