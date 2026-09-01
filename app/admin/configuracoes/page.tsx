import { createClient } from "@/lib/supabase/server";
import { ConfiguracoesForm } from "./ConfiguracoesForm";

export default async function AdminConfiguracoes() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select(
      `parcelamento_max_installments, mp_taxa_cartao_avista_percent, mp_taxa_cartao_2a6x_percent,
       mp_taxa_cartao_7a12x_percent, mp_taxa_cartao_13a18x_percent, mp_taxa_pix_percent,
       mp_taxa_boleto_reais, mp_taxa_parcelamento_2x_percent, mp_taxa_parcelamento_13a18x_percent`
    )
    .eq("id", true)
    .single();

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Configurações de parcelamento</h1>
      <p className="text-sm text-muted mb-6">
        A loja opera no modelo <strong>Parcelado Vendedor</strong> do Mercado Pago: o cliente nunca paga juros ao
        parcelar, o total é sempre o mesmo dividido em N vezes — quem absorve o custo crescente por faixa de
        parcela é a loja. As taxas abaixo são só pra sua referência (não aparecem pro cliente); copie da sua
        conta Mercado Pago em <strong>Seu negócio → Taxas e parcelamento</strong> sempre que ela mudar.
      </p>

      <ConfiguracoesForm
        maxInstallments={settings?.parcelamento_max_installments ?? 12}
        taxaCartaoAvista={Number(settings?.mp_taxa_cartao_avista_percent ?? 4.98)}
        taxaCartao2a6x={Number(settings?.mp_taxa_cartao_2a6x_percent ?? 2.99)}
        taxaCartao7a12x={Number(settings?.mp_taxa_cartao_7a12x_percent ?? 3.09)}
        taxaCartao13a18x={Number(settings?.mp_taxa_cartao_13a18x_percent ?? 3.09)}
        taxaPix={Number(settings?.mp_taxa_pix_percent ?? 0.99)}
        taxaBoleto={Number(settings?.mp_taxa_boleto_reais ?? 3.49)}
        taxaParcelamento2x={Number(settings?.mp_taxa_parcelamento_2x_percent ?? 4.52)}
        taxaParcelamento13a18x={Number(settings?.mp_taxa_parcelamento_13a18x_percent ?? 20.51)}
      />
    </div>
  );
}
