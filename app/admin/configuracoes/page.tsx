import { calcularParcelamento, formatBRL } from "@/lib/pricing";
import { getConfiguracaoParcelamento } from "@/lib/data/pricing-settings";
import { FormularioParcelamento } from "./FormularioParcelamento";

export const metadata = { title: "Parcelamento" };

const VALOR_EXEMPLO_CENTS = 99900;

export default async function AdminConfiguracoes() {
  const config = await getConfiguracaoParcelamento();
  const opcoes = calcularParcelamento(VALOR_EXEMPLO_CENTS, config);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Parcelamento</h1>
      <p className="text-sm text-muted mb-6">
        Hoje: até <strong>{config.maxParcelasSemJuros}x sem juros</strong> (loja absorve o custo) e até{" "}
        <strong>{config.maxParcelasComJuros}x com juros</strong> do comprador. Ajuste abaixo sempre que a
        condição do Mercado Pago mudar — a loja inteira (cards, página do produto, checkout e a preferência
        enviada ao Mercado Pago) usa esses valores.
      </p>

      <FormularioParcelamento config={config} />

      <div className="rounded-2xl border border-border bg-surface overflow-hidden mt-6">

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[#f7f8fa] text-left text-xs text-muted uppercase">
              <th className="px-4 py-2.5">Parcelas</th>
              <th className="px-4 py-2.5">Quem paga os juros</th>
              <th className="px-4 py-2.5 text-right">
                Valor da parcela
                <span className="block normal-case font-normal">para uma venda de {formatBRL(VALOR_EXEMPLO_CENTS)}</span>
              </th>
              <th className="px-4 py-2.5 text-right">Total pago pelo comprador</th>
            </tr>
          </thead>
          <tbody>
            {opcoes.map((o) => (
              <tr key={o.count} className="border-b border-border last:border-0">
                <td className="px-4 py-2 font-semibold text-foreground">{o.count}x</td>
                <td className="px-4 py-2 text-muted">
                  {o.interestFree
                    ? o.count === 1
                      ? "— (à vista)"
                      : "Loja (sem juros pro cliente)"
                    : "Comprador (juros do emissor)"}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-foreground">{formatBRL(o.installmentCents)}</td>
                <td className="px-4 py-2 text-right tabular-nums text-muted">{formatBRL(o.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted mt-4">
        Até {config.maxParcelasSemJuros}x a loja absorve o custo crescente e o cliente sempre paga o valor
        cheio. De {config.maxParcelasSemJuros + 1}x em diante a loja recebe como se fosse à vista, e o
        Mercado Pago cobra os juros direto do comprador na tela de pagamento.
      </p>
    </div>
  );
}
