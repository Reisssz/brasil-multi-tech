"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { comprarEtiqueta, dimensoesDaVariante } from "@/lib/melhor-envio/client";
import { revalidatePath } from "next/cache";

async function verificarAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return perfil?.role === "admin";
}

export async function atualizarStatusPedido(pedidoId: string, formData: FormData) {
  const supabase = await createClient();
  if (!(await verificarAdmin(supabase))) return;

  const status = String(formData.get("status") ?? "");
  if (!status) return;

  await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", pedidoId);
  revalidatePath(`/admin/pedidos/${pedidoId}`);
  revalidatePath("/admin/pedidos");
}

type EstadoEtiqueta = { erro?: string; sucesso?: boolean } | null;

const STATUS_QUE_ACEITAM_RASTREIO = ["paid", "preparing", "shipped"];

/**
 * Grava o código de rastreio digitado pelo admin. Cria o envio manual (sem
 * etiqueta Melhor Envio) ou, se já existir um envio, só atualiza o código.
 */
export async function salvarRastreioManual(
  pedidoId: string,
  _estadoAnterior: EstadoEtiqueta,
  formData: FormData
): Promise<EstadoEtiqueta> {
  const supabaseSessao = await createClient();
  if (!(await verificarAdmin(supabaseSessao))) return { erro: "Apenas administradores podem informar o rastreio." };

  const codigo = String(formData.get("codigo") ?? "").trim().toUpperCase();
  const urlInformada = String(formData.get("url") ?? "").trim();

  if (!/^[A-Z0-9-]{5,40}$/.test(codigo)) {
    return { erro: "Informe um código de rastreio válido (letras e números, de 5 a 40 caracteres)." };
  }

  let url: string | null = null;
  if (urlInformada) {
    try {
      const parsed = new URL(urlInformada);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
      url = parsed.toString();
    } catch {
      return { erro: "O link de rastreio precisa ser um endereço http(s) válido." };
    }
  }

  const { data: pedido } = await supabaseSessao.from("orders").select("id, status").eq("id", pedidoId).single();
  if (!pedido) return { erro: "Pedido não encontrado." };

  // Escrita em `shipments` só via service_role (a tabela só tem policy de SELECT).
  const supabaseAdmin = createAdminClient();
  const { data: envio } = await supabaseAdmin.from("shipments").select("id").eq("order_id", pedidoId).maybeSingle();

  if (envio) {
    const { error } = await supabaseAdmin
      .from("shipments")
      .update({ tracking_code: codigo, tracking_url: url })
      .eq("id", envio.id);
    if (error) {
      console.error("[admin/pedidos] falha ao atualizar rastreio:", error.message);
      return { erro: "Não foi possível salvar o código de rastreio." };
    }
  } else {
    if (!STATUS_QUE_ACEITAM_RASTREIO.includes(pedido.status)) {
      return { erro: "Só é possível informar rastreio em pedidos pagos." };
    }

    const { error } = await supabaseAdmin.from("shipments").insert({
      order_id: pedidoId,
      melhor_envio_id: null,
      price: 0,
      status: "manual",
      tracking_code: codigo,
      tracking_url: url,
    });
    if (error) {
      console.error("[admin/pedidos] falha ao registrar rastreio manual:", error.message);
      return { erro: "Não foi possível salvar o código de rastreio." };
    }
  }

  if (pedido.status === "paid" || pedido.status === "preparing") {
    await supabaseAdmin
      .from("orders")
      .update({ status: "shipped", updated_at: new Date().toISOString() })
      .eq("id", pedidoId);
  }

  revalidatePath(`/admin/pedidos/${pedidoId}`);
  revalidatePath("/admin/pedidos");
  return { sucesso: true };
}

/**
 * Compra a etiqueta de envio no Melhor Envio para um pedido pago, usando o
 * serviço/CEP escolhido pelo cliente no checkout (salvo em
 * orders.endereco_entrega). Grava o resultado em `shipments`.
 */
export async function gerarEtiquetaDoPedido(
  pedidoId: string,
  _estadoAnterior: EstadoEtiqueta,
  _formData: FormData
): Promise<EstadoEtiqueta> {
  // A LEITURA respeita RLS normalmente (sessão do admin); a ESCRITA em
  // `shipments` precisa do client admin, porque essa tabela só tem policy
  // de SELECT — escritas são só via service_role de propósito.
  const supabaseSessao = await createClient();
  const supabaseAdmin = createAdminClient();

  if (!(await verificarAdmin(supabaseSessao))) {
    return { erro: "Apenas administradores podem gerar etiquetas." };
  }

  const { data: pedido, error: erroPedido } = await supabaseSessao
    .from("orders")
    .select("id, status, items, endereco_entrega")
    .eq("id", pedidoId)
    .single();

  if (erroPedido || !pedido) {
    return { erro: "Pedido não encontrado." };
  }

  if (pedido.status !== "paid") {
    return { erro: "Só é possível gerar etiqueta para pedidos pagos." };
  }

  const { data: etiquetaExistente } = await supabaseSessao
    .from("shipments")
    .select("id")
    .eq("order_id", pedidoId)
    .maybeSingle();

  if (etiquetaExistente) {
    return { erro: "Esse pedido já tem uma etiqueta gerada." };
  }

  const endereco = pedido.endereco_entrega as {
    cep: string;
    street: string;
    numero: string;
    complemento?: string;
    city: string;
    state: string;
    nome: string;
    documento: string;
    telefone: string;
    frete_servico_id?: number;
  };

  if (!endereco.frete_servico_id) {
    return { erro: "Este pedido não tem um serviço de frete selecionado (compra antiga ou sem frete calculado)." };
  }

  const itens = (pedido.items ?? []) as Array<{
    nome: string;
    quantidade: number;
    precoUnitarioCents: number;
    larguraCm?: number;
    alturaCm?: number;
    comprimentoCm?: number;
    pesoKg?: number;
  }>;

  if (itens.length === 0) {
    return { erro: "Pedido sem itens registrados." };
  }

  try {
    const etiqueta = await comprarEtiqueta({
      servicoId: endereco.frete_servico_id,
      destinatario: {
        nome: endereco.nome,
        documento: (endereco.documento ?? "").replace(/\D/g, ""),
        telefone: endereco.telefone ?? "",
        email: "",
        cep: (endereco.cep ?? "").replace(/\D/g, ""),
        endereco: endereco.street,
        numero: endereco.numero,
        bairro: "",
        cidade: endereco.city,
        uf: endereco.state,
        complemento: endereco.complemento,
      },
      itens: itens.map((item) => ({
        nome: item.nome,
        quantidade: item.quantidade,
        valorUnitarioCents: item.precoUnitarioCents,
        // Pedidos antigos não têm as medidas no snapshot e caem no fallback padrão.
        ...dimensoesDaVariante({
          widthCm: item.larguraCm,
          heightCm: item.alturaCm,
          lengthCm: item.comprimentoCm,
          weightGrams: item.pesoKg ? item.pesoKg * 1000 : undefined,
        }),
      })),
    });

    await supabaseAdmin.from("shipments").insert({
      order_id: pedidoId,
      melhor_envio_id: etiqueta.melhorEnvioId,
      price: etiqueta.precoFreteCents / 100,
      status: etiqueta.status,
      tracking_code: etiqueta.tracking,
    });

    await supabaseAdmin.from("orders").update({ status: "shipped" }).eq("id", pedidoId);

    revalidatePath(`/admin/pedidos/${pedidoId}`);
    revalidatePath("/admin/pedidos");

    return { sucesso: true };
  } catch (erro) {
    console.error("[admin/pedidos] falha ao gerar etiqueta:", erro);
    return { erro: "Não foi possível gerar a etiqueta. Verifique o saldo da carteira Melhor Envio e se a conexão OAuth está ativa." };
  }
}
