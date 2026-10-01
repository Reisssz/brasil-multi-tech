import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buscarStatusRastreio } from "@/lib/melhor-envio/client";

// Protege o endpoint: só executa se o header bater com o secret do cron
// (evita qualquer um na internet disparar isso).
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: pendentes, error } = await supabase
    .from("shipments")
    .select("id, order_id, melhor_envio_id")
    .limit(100);

  if (error) {
    console.error("[cron/rastreios] erro ao buscar pendentes:", error);
    return NextResponse.json({ error: "falha ao buscar pendentes" }, { status: 500 });
  }

  if (!pendentes || pendentes.length === 0) {
    return NextResponse.json({ atualizados: 0 });
  }

  const resultados = await buscarStatusRastreio(pendentes.map((p) => p.melhor_envio_id));

  let atualizados = 0;
  for (const resultado of resultados) {
    const shipment = pendentes.find((p) => p.melhor_envio_id === resultado.melhorEnvioId);
    if (!shipment) continue;

    const atualizacao: { tracking_code?: string; status?: string } = {};
    if (resultado.tracking) atualizacao.tracking_code = resultado.tracking;
    if (resultado.status) atualizacao.status = resultado.status;
    if (Object.keys(atualizacao).length === 0) continue;

    const { error: erroAtualizacao } = await supabase
      .from("shipments")
      .update(atualizacao)
      .eq("id", shipment.id);
    if (erroAtualizacao) {
      console.error("[cron/rastreios] erro ao atualizar envio:", shipment.id, erroAtualizacao.message);
      continue;
    }

    if (resultado.status && /deliver|entreg|received/i.test(resultado.status)) {
      await supabase
        .from("orders")
        .update({ status: "delivered", updated_at: new Date().toISOString() })
        .eq("id", shipment.order_id)
        .neq("status", "delivered");
    }

    atualizados++;
  }

  return NextResponse.json({ atualizados, verificados: pendentes.length });
}