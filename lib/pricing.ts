/**
 * O preço exibido é sempre o mesmo, qualquer que seja a forma de pagamento
 * — sem desconto no Pix nem simulação de parcelas/juros do cartão aqui de
 * propósito: quem processa o cartão é o Mercado Pago (Checkout Pro), e não
 * temos acesso às taxas reais dos emissores para exibir um número
 * confiável no site. A seleção de parcelas acontece na tela de pagamento
 * do Mercado Pago, com as opções e juros reais de cada cartão.
 */
export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
