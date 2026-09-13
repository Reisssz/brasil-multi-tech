import Link from "next/link";
import { SITE } from "@/lib/config";
import { TrustSection } from "@/components/home/TrustSection";
import { Depoimentos } from "@/components/home/Depoimentos";

export const metadata = { title: "Brasil Multi Tech é confiável?" };

const pontos = [
  {
    title: "Empresa identificada e com endereço físico",
    body:
      `A Brasil Multi Tech (CNPJ 29.853.621/0001-08) tem loja física em ${SITE.address.line1}, ${SITE.address.line2}, em Belém - PA — não é um perfil anônimo de rede social. Todos os dados da empresa ficam disponíveis nos Termos e Condições do Site.`,
  },
  {
    title: "Avaliação transparente do seu aparelho",
    body:
      "O valor do seu celular é calculado com base em respostas objetivas sobre modelo, armazenamento e estado de conservação (tela, carcaça e saúde da bateria). Essa estimativa só é confirmada como valor final depois que nossa equipe recebe e analisa o aparelho fisicamente — sem letra miúda.",
  },
  {
    title: "Oferta e contrato por escrito",
    body:
      "Toda oferta de compra ou venda fica registrada na sua conta e é confirmada por e-mail, com os dados do pedido — essa confirmação formaliza o acordo entre você e a Brasil Multi Tech, conforme descrito nos Termos e Condições.",
  },
  {
    title: "Seus dados protegidos",
    body:
      "Os dados pessoais informados no cadastro são tratados conforme a Política de Privacidade e a Lei Geral de Proteção de Dados (LGPD), com finalidade, segurança e retenção definidas — e você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento.",
  },
  {
    title: "Acompanhamento do envio",
    body:
      "Assim que o aparelho é postado (seu ou nosso), você recebe o código de rastreamento e pode acompanhar cada etapa até a entrega na página de rastreio de pedido.",
  },
  {
    title: "Análise técnica antes de qualquer pagamento",
    body:
      "Todo aparelho — vendido ou comprado — passa por conferência de IMEI e checagem técnica antes da liberação do pagamento ou da finalização da troca/devolução, evitando surpresas para os dois lados.",
  },
  {
    title: "Garantia e política de troca por escrito",
    body:
      "Aparelhos seminovos saem com 6 meses de garantia, além da garantia legal de 90 dias, e você tem 7 dias corridos para se arrepender de uma compra sem precisar justificar. Tudo isso está detalhado, com prazos e condições, na página de garantia.",
  },
  {
    title: "Canais oficiais, sem intermediários",
    body:
      `Atendimento só pelo Site, WhatsApp ${SITE.whatsappDisplay}, telefone ${SITE.phoneDisplay} e loja física — a Brasil Multi Tech não se responsabiliza por compras feitas em perfis, páginas ou números que não sejam oficialmente identificados pela empresa.`,
  },
];

export default function ConfiavelPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-12 pt-12">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Brasil Multi Tech é confiável?
        </h1>
        <p className="text-muted mb-8">
          Sim — e explicamos exatamente por quê. Segurança, transparência e canais oficiais em cada etapa da
          compra, venda ou troca do seu aparelho.
        </p>
      </div>

      <TrustSection />

      <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-6">
          {pontos.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-bold text-foreground mb-2">{p.title}</h2>
              <p className="text-sm text-muted leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      <Depoimentos />

      <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-12 pb-12">
        <div className="rounded-2xl bg-brand-light p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-foreground">Ainda com dúvidas?</h2>
            <p className="text-sm text-muted">
              Leia os <Link href="/termos" className="font-semibold hover:underline underline-offset-2">Termos e Condições</Link> completos ou fale direto com a gente.
            </p>
          </div>
          <Link
            href="/contato"
            className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 px-6 text-sm transition-colors shrink-0"
          >
            Falar com a gente
          </Link>
        </div>
      </div>
    </div>
  );
}
