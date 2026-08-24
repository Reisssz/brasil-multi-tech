import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { mpPayment } from "@/lib/mercadopago/client";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Confirma pagamentos de verdade. O Mercado Pago chama esta URL sempre que
 * um pagamento muda de status — NUNCA confie no redirect do navegador
 * (back_urls) para liberar o pedido, só este webhook com assinatura
 * validada e o status lido direto da API do Mercado Pago.
 */
export async function POST(request: NextRequest) {
  const bodyTexto = await request.text();
  let bodyJson: { data?: { id?: string }; id?: string; resource?: string; topic?: string } | null = null;
  try {
    bodyJson = bodyTexto ? JSON.parse(bodyTexto) : null;
  } catch {
    bodyJson = null;
  }

  // O Mercado Pago manda o id do pagamento de formas diferentes dependendo
  // de qual "evento" foi marcado na configuração do webhook:
  // - formato novo (data.id): { data: { id: "..." } } ou ?data.id=... na URL
  // - formato legado (o que "Pagamentos (legacy)" realmente envia):
  //   { topic: "payment", resource: "<id ou URL do pagamento>" }
  //   o "resource" às vezes vem como só o número, às vezes como URL
  //   completa (.../v1/payments/123) — pegamos sempre o último segmento
  //   numérico, cobre os dois casos.
  function extrairIdDoResource(resource: string | undefined): string | null {
    if (!resource) return null;
    const numeros = resource.match(/\d+/g);
    return numeros ? numeros[numeros.length - 1] : null;
  }

  const dataId =
    request.nextUrl.searchParams.get("data.id") ??
    bodyJson?.data?.id ??
    bodyJson?.id ??
    (bodyJson?.topic === "payment" ? extrairIdDoResource(bodyJson.resource) : null) ??
    null;

  const xSignature = request.headers.get("x-signature") ?? "";
  const xRequestId = request.headers.get("x-request-id") ?? "";

  if (!dataId) {
    console.error("[mercadopago:webhook] data.id ausente. Corpo recebido:", bodyTexto);
    return NextResponse.json({ error: "data.id ausente" }, { status: 400 });
  }

  if (!validarAssinatura(xSignature, xRequestId, dataId)) {
    console.error("[mercadopago:webhook] assinatura inválida");
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  let pagamento;
  try {
    pagamento = await mpPayment.get({ id: dataId });
  } catch (erro) {
    // Acontece sempre que o id não existe de verdade — é exatamente o caso
    // do botão "Simular notificação" do painel do Mercado Pago, que manda
    // um id fictício (ex: "123456"). Não é uma falha real: respondemos 200
    // para o Mercado Pago não ficar retentando, só não há nada a processar.
    console.warn("[mercadopago:webhook] pagamento não encontrado na API (provável teste/simulação):", dataId, erro);
    return NextResponse.json({ received: true, aviso: "pagamento não encontrado — provável simulação" });
  }

  const orderId = pagamento.external_reference;
  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();

  const { data: pedidoAtual } = await supabase
    .from("orders")
    .select("status, user_id, items")
    .eq("id", orderId)
    .single();

  await supabase.from("payments").upsert(
    {
      order_id: orderId,
      mp_payment_id: String(pagamento.id),
      mp_status: pagamento.status ?? null,
      mp_status_detail: pagamento.status_detail ?? null,
      metodo: pagamento.payment_type_id ?? null,
      valor: pagamento.transaction_amount ?? 0,
      raw_payload: pagamento as unknown as Record<string, unknown>,
    },
    { onConflict: "mp_payment_id" }
  );

  const statusPedido = mapearStatusPedido(pagamento.status);
  if (statusPedido) {
    await supabase.from("orders").update({ status: statusPedido }).eq("id", orderId);

    // Só baixa estoque na PRIMEIRA vez que o pedido vira "paid" — o Mercado
    // Pago pode reenviar o mesmo webhook várias vezes, e sem essa checagem
    // o estoque descontaria em dobro/triplo a cada reentrega.
    if (statusPedido === "paid" && pedidoAtual?.status !== "paid") {
      const itens = (pedidoAtual?.items ?? []) as Array<{ variantId: string; quantidade: number }>;
      for (const item of itens) {
        await supabase.rpc("decrement_stock", { p_variant_id: item.variantId, p_qty: item.quantidade });
      }

      await supabase.from("activity_logs").insert({
        user_id: pedidoAtual?.user_id ?? null,
        event_type: "order_paid",
        metadata: { pedidoId: orderId, valor: pagamento.transaction_amount },
      });
    }
  }

  return NextResponse.json({ received: true });
}

function mapearStatusPedido(statusMp: string | undefined): "paid" | "cancelled" | "refunded" | null {
  switch (statusMp) {
    case "approved":
      return "paid";
    case "rejected":
    case "cancelled":
      return "cancelled";
    case "refunded":
    case "charged_back":
      return "refunded";
    default:
      return null;
  }
}

function validarAssinatura(xSignature: string, xRequestId: string, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[mercadopago:webhook] MERCADOPAGO_WEBHOOK_SECRET não configurado — pulando validação.");
    return true;
  }

  const partes = Object.fromEntries(
    xSignature.split(",").map((parte) => {
      const [chave, valor] = parte.split("=");
      return [chave?.trim(), valor?.trim()];
    })
  );

  const ts = partes.ts;
  const hashRecebido = partes.v1;
  if (!ts || !hashRecebido) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const hashCalculado = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hashCalculado), Buffer.from(hashRecebido));
}