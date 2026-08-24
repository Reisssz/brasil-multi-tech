import Link from "next/link";
import { FaqAccordion } from "@/components/ui/FaqAccordion";

export const metadata = { title: "Venda seu aparelho" };

const faqs = [
  {
    question: "Como vocês calculam o valor do meu aparelho?",
    answer:
      "Você responde algumas perguntas sobre modelo, armazenamento, estado da tela, da carcaça, saúde da bateria e se alguma peça já foi trocada ou está quebrada. Com isso calculamos uma estimativa na hora. O valor final é confirmado depois que nossa equipe recebe e analisa o aparelho fisicamente.",
  },
  {
    question: "A estimativa que aparece na hora é o valor final?",
    answer:
      "É uma estimativa baseada no que você respondeu. Depois que enviamos, nossa equipe entra em contato para confirmar os detalhes e, se for o caso, combinar o envio ou entrega do aparelho para avaliação física antes do pagamento.",
  },
  {
    question: "Como recebo o pagamento?",
    answer: "O pagamento é feito via Pix ou transferência bancária, direto na sua conta, depois da confirmação do aparelho.",
  },
  {
    question: "Preciso pagar algo para enviar o aparelho?",
    answer: "Não. Depois que sua proposta é aceita, orientamos sobre a forma de envio ou entrega, sem custo para você.",
  },
  {
    question: "E se eu não souber a saúde da bateria do meu celular?",
    answer:
      "Sem problema — tem uma opção \"não sei\" no formulário. No iPhone, você encontra em Ajustes > Bateria > Saúde da Bateria. No Android, o caminho varia por marca, mas se não souber, é só marcar essa opção.",
  },
];

export default function VenderPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-brand text-xs font-semibold px-3 py-1.5 mb-4">
            Venda rápido e com segurança
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-3">
            Nunca foi tão fácil vender o aparelho que você não usa mais
          </h1>
          <p className="text-ink-muted max-w-xl mx-auto mb-8">
            Responda algumas perguntas rápidas sobre o estado do seu celular e veja na hora uma estimativa de
            quanto podemos pagar por ele.
          </p>
          <Link
            href="/vender/formulario"
            className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-bold text-sm h-12 px-8 transition-colors active:scale-95"
          >
            Quero vender meu aparelho
          </Link>
        </div>
      </section>

      {/* Como funciona */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        <h2 className="font-display text-2xl font-bold text-foreground text-center mb-10">Como funciona</h2>
        <div className="grid sm:grid-cols-4 gap-5">
          {[
            {
              n: "1",
              title: "Conte sobre o aparelho",
              text: "Marca, modelo, armazenamento, cor e o estado geral — tela, carcaça, bateria.",
            },
            {
              n: "2",
              title: "Veja a estimativa",
              text: "Calculamos na hora um valor estimado com base no que você respondeu.",
            },
            {
              n: "3",
              title: "Confirmamos com você",
              text: "Nossa equipe entra em contato para confirmar os detalhes e combinar o envio.",
            },
            {
              n: "4",
              title: "Você recebe o pagamento",
              text: "Depois da avaliação física, o pagamento é feito via Pix ou transferência.",
            },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-surface p-5 text-center">
              <span className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-full bg-brand-light text-brand-dark font-display font-bold">
                {s.n}
              </span>
              <h3 className="font-bold text-foreground text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/vender/formulario"
            className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-bold text-sm h-12 px-8 transition-colors active:scale-95"
          >
            Preencher formulário
          </Link>
        </div>
      </section>

      {/* Por que vender pra gente */}
      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            Por que vender para a Brasil Multi Tech?
          </h2>
          <ul className="flex flex-col gap-3">
            {[
              "Transação segura, sem burocracia",
              "Pagamento direto na sua conta, via Pix ou transferência",
              "Você não paga nada para enviar o aparelho",
              "Damos uma nova vida ao seu aparelho, reduzindo lixo eletrônico",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-success">
                  <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">Perguntas frequentes</h2>
        <FaqAccordion items={faqs} />

        <div className="mt-10 flex justify-center">
          <Link
            href="/vender/formulario"
            className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-bold text-sm h-12 px-8 transition-colors active:scale-95"
          >
            Quero vender meu aparelho
          </Link>
        </div>
      </section>
    </div>
  );
}
