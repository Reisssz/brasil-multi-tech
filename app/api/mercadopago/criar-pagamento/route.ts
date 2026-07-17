import { NextRequest, NextResponse } from "next/server";

interface CreatePaymentBody {
  orderId: string;
  totalCents: number;
  payerEmail: string;
  paymentMethod: "pix" | "boleto" | "cartao";
  installments?: number;
}

/**
 * Stub for creating a Mercado Pago Checkout Pro preference / Checkout Transparente payment.
 *
 * To go live:
 * 1. `npm install mercadopago` and set MERCADOPAGO_ACCESS_TOKEN as an env var (server-side only).
 * 2. For Checkout Pro: create a Preference with items derived from the order and return init_point/point_of_interaction.
 * 3. For Checkout Transparente (Pix/boleto/card form): create a Payment directly with the token from the front-end
 *    card form (for cards) or request a Pix QR code / boleto barcode (for those methods).
 * 4. Persist the resulting payment/preference id against the order so the webhook can reconcile status later.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CreatePaymentBody | null;

  if (!body?.orderId || !body.totalCents || !body.payerEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // TODO: call the Mercado Pago SDK here instead of returning a mock response.
  return NextResponse.json({
    mocked: true,
    message: "Checkout de demonstração — integre o SDK do Mercado Pago para processar pagamentos reais.",
    orderId: body.orderId,
  });
}
