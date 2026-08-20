import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "É preciso estar logado." }, { status: 401 });
  }

  const { data: pedido, error } = await supabase
    .from("orders")
    .select("id, status, total, items, endereco_entrega, created_at, user_id")
    .eq("id", id)
    .single();

  if (error || !pedido || pedido.user_id !== user.id) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const { data: envio } = await supabase
    .from("shipments")
    .select("status, tracking_code, tracking_url")
    .eq("order_id", id)
    .maybeSingle();

  return NextResponse.json({ pedido, envio: envio ?? null });
}
