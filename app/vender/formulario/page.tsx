import { createClient } from "@/lib/supabase/server";
import { VenderWizard, type TradeInRequestRow } from "./VenderWizard";

export const metadata = { title: "Vender aparelho" };

export default async function FormularioVenderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialRequest: TradeInRequestRow | null = null;
  let perfilNome: string | null = null;
  let perfilTelefone: string | null = null;

  if (user) {
    const [{ data: solicitacao }, { data: perfil }] = await Promise.all([
      supabase
        .from("trade_in_requests")
        .select(
          "id, status, category, brand, model, storage_gb, color, imei, offer_type, estimated_value_cents, final_value_cents, proposal_expires_at, contract_accepted_name, contract_accepted_at, payment_method, payment_pix_key, payment_bank_details"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("profiles").select("nome_completo, telefone").eq("id", user.id).single(),
    ]);

    initialRequest = solicitacao as TradeInRequestRow | null;
    perfilNome = perfil?.nome_completo ?? null;
    perfilTelefone = perfil?.telefone ?? null;
  }

  return (
    <VenderWizard
      userEmail={user?.email ?? null}
      perfilNome={perfilNome}
      perfilTelefone={perfilTelefone}
      initialRequest={initialRequest}
    />
  );
}
