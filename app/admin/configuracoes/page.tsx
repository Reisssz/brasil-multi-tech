import { calcularParcelamento, formatBRL, MAX_PARCELAS_SEM_JUROS } from "@/lib/pricing";

export const metadata = { title: "Parcelamento" };

const VALOR_EXEMPLO_CENTS = 99900;

export default function AdminConfiguracoes() {
  const opcoes = calcularParcelamento(VALOR_EXEMPLO_CENTS);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Parcelamento</h1>
      <p className="text-sm text-muted mb-6">
        Tabela fixa de taxas do Checkout Pro (Mercado Pago), copiada de <strong>Seu negócio → Taxas e
        parcelamento</strong>. Não é mais configurável por aqui — para mudar algum valor, edite as constantes{" "}
        <code className="text-xs bg-[#f0f1f4] rounded px-1 py-0.5">TAXA_LOJA_SEM_JUROS_PERCENT</code> e{" "}
        <code className="text-xs bg-[#f0f1f4] rounded px-1 py-0.5">JUROS_COMPRADOR_PERCENT</code> em{" "}
        <code className="text-xs bg-[#f0f1f4] rounded px-1 py-0.5">lib/pricing.ts</code> sempre que a taxa
        do Mercado Pago mudar.
      </p>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
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
        Até {MAX_PARCELAS_SEM_JUROS}x a loja absorve o custo crescente e o cliente sempre paga o valor cheio.
        De {MAX_PARCELAS_SEM_JUROS + 1}x em diante a loja recebe como se fosse à vista, e o Mercado Pago cobra
        os juros direto do comprador na tela de pagamento.
      </p>
    </div>
  );
}
