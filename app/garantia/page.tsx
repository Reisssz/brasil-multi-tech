const sections = [
  {
    title: "Garantia Brasil Multi Tech",
    body:
      "Todos os produtos novos contam com garantia de fábrica somada à garantia estendida da Brasil Multi Tech. Aparelhos seminovos têm garantia de 12 meses cobrindo defeitos de fabricação e funcionamento, incluindo bateria, tela e câmeras.",
  },
  {
    title: "O que a garantia cobre",
    body:
      "Defeitos de fabricação, mau funcionamento de componentes internos (bateria, tela, câmera, botões, conectores) e problemas de software originados de defeito de hardware.",
  },
  {
    title: "O que não é coberto",
    body:
      "Danos por queda, contato com líquido, uso indevido, desgaste natural de acessórios (cabos e capas) e violação do lacre por terceiros não autorizados.",
  },
  {
    title: "Troca e devolução",
    body:
      "Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução, mesmo sem defeito, conforme o Código de Defesa do Consumidor. O produto deve estar em perfeito estado, com todos os acessórios originais.",
  },
  {
    title: "Como acionar a garantia",
    body:
      "Entre em contato pelo WhatsApp ou pelo e-mail de atendimento informando o número do pedido e o defeito identificado. Nossa equipe vai orientar sobre o envio do aparelho para análise técnica, sem custo para você.",
  },
];

export default function WarrantyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">Garantia e trocas</h1>
      <p className="text-muted mb-8">
        Transparência do início ao fim: veja exatamente como funciona a nossa garantia e a política de trocas.
      </p>
      <div className="flex flex-col gap-6">
        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-bold text-foreground mb-2">{s.title}</h2>
            <p className="text-sm text-muted leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
