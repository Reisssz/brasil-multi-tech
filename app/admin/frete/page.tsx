import { getConfiguracaoFreteFixo } from "@/lib/data/shipping-settings";
import { NOME_REGIAO, Regiao } from "@/lib/shipping/regiao";
import { formatBRL } from "@/lib/pricing";
import { FormularioFreteFixo } from "./FormularioFreteFixo";

export const metadata = { title: "Frete" };

export default async function AdminFrete() {
  const config = await getConfiguracaoFreteFixo();

  const regras: Array<{ regiao: Regiao; regra: string }> = [
    { regiao: "norte", regra: "Melhor Envio" },
    { regiao: "nordeste", regra: "Melhor Envio" },
    { regiao: "centro-oeste", regra: "Melhor Envio" },
    { regiao: "sul", regra: config.ativo ? `Valor fixo — ${formatBRL(config.sulCents)}` : "Melhor Envio (frete fixo desativado)" },
    {
      regiao: "sudeste",
      regra: config.ativo ? `Valor fixo — ${formatBRL(config.sudesteCents)}` : "Melhor Envio (frete fixo desativado)",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Frete</h1>
      <p className="text-sm text-muted mb-6">
        Com o frete fixo ativo, pedidos para o Sul e o Sudeste (identificados pelo CEP) cobram o valor abaixo, mesmo
        em produtos com frete grátis; use R$ 0,00 para entregar de graça. As demais regiões continuam com a cotação
        automática do Melhor Envio.
      </p>

      <FormularioFreteFixo config={config} />

      <div className="rounded-2xl border border-border bg-surface overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[#f7f8fa] text-left text-xs text-muted uppercase">
              <th className="px-4 py-2.5">Região</th>
              <th className="px-4 py-2.5">Regra de frete</th>
            </tr>
          </thead>
          <tbody>
            {regras.map(({ regiao, regra }) => (
              <tr key={regiao} className="border-b border-border last:border-0">
                <td className="px-4 py-2 font-semibold text-foreground">{NOME_REGIAO[regiao]}</td>
                <td className="px-4 py-2 text-muted">{regra}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
