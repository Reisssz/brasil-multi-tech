import { NextRequest, NextResponse } from "next/server";

/**
 * Mercado Pago webhook stub.
 *
 * To go live:
 * 1. Create a Mercado Pago application and set MERCADOPAGO_ACCESS_TOKEN + MERCADOPAGO_WEBHOOK_SECRET as env vars.
 * 2. Register this URL (https://<domain>/api/mercadopago/webhook) as the notification URL in the MP dashboard.
 * 3. Validate the request signature (x-signature / x-request-id headers) against MERCADOPAGO_WEBHOOK_SECRET.
 * 4. Fetch the payment/merchant_order resource from the MP API using the id in the payload.
 * 5. Update the order status in your database (Supabase/Firebase) based on the payment status
 *    (approved / pending / rejected) and trigger any split-payment logic for marketplace sellers.
 */
export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  console.log("[mercadopago:webhook] received notification", payload);

  // TODO: verify signature, fetch payment details, update order status.

  return NextResponse.json({ received: true });
}
