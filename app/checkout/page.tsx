"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, resolveCartLine } from "@/lib/cart-context";
import { formatBRL, getPixPriceCents } from "@/lib/pricing";
import { PaymentMethod } from "@/lib/orders";
import { CheckoutComboSuggestions } from "@/components/checkout/CheckoutComboSuggestions";

type Step = 1 | 2 | 3;

type OpcaoFrete = {
  id: number;
  nome: string;
  transportadora: string;
  precoOriginalCents: number;
  precoComDescontoCents: number;
  prazoDias: number;
};

export default function CheckoutPage() {
  const { items, totalCents, clear } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [erroSubmit, setErroSubmit] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");

  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<OpcaoFrete | null>(null);
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [erroFrete, setErroFrete] = useState<string | null>(null);
  const [avisoFrete, setAvisoFrete] = useState<string | null>(null);
  const [freteGratisAplicado, setFreteGratisAplicado] = useState(false);

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepEncontrado, setCepEncontrado] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

  const dadosValid = customerName.trim().length > 2 && email.includes("@") && cpf.trim().length >= 11;
  const enderecoValid =
    cep.trim().length >= 8 &&
    street.trim().length > 3 &&
    numero.trim().length > 0 &&
    city.trim().length > 1 &&
    stateUf.trim().length === 2;

  const freteCents = freteSelecionado?.precoComDescontoCents ?? 0;
  const pixTotal = getPixPriceCents(totalCents) + freteCents;
  // O total no cartão não é calculado aqui: quem processa é o Mercado Pago,
  // e as parcelas/juros reais só são definidos na tela de pagamento dele —
  // um valor calculado por nós poderia não bater com o que é cobrado de
  // verdade.
  const cardTotal = totalCents + freteCents;

  if (items.length === 0 && !submitting) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-20 text-center flex flex-col items-center gap-4">
        <h1 className="text-xl font-bold text-foreground">Seu carrinho está vazio</h1>
        <p className="text-sm text-muted">Adicione produtos ao carrinho antes de finalizar a compra.</p>
        <Link
          href="/categoria/ofertas"
          className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 px-6 text-sm transition-colors"
        >
          Ver ofertas
        </Link>
      </div>
    );
  }

  async function buscarEnderecoPorCep(valorCep: string) {
    const cepLimpo = valorCep.replace(/\D/g, "");
    setCepEncontrado(null);

    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await resposta.json();

      if (dados.erro) {
        setErroFrete("CEP não encontrado. Confira se digitou certo — ele deve ter 8 números.");
        return;
      }

      setStreet(dados.logradouro || "");
      setCity(dados.localidade || "");
      setStateUf(dados.uf || "");
      setCepEncontrado(`${dados.logradouro ? dados.logradouro + ", " : ""}${dados.bairro ? dados.bairro + " — " : ""}${dados.localidade}/${dados.uf}`);
      setErroFrete(null);
    } catch {
      // ViaCEP indisponível não deve travar o checkout — o cliente ainda
      // pode preencher o endereço manualmente.
    } finally {
      setBuscandoCep(false);
    }
  }

  async function calcularFrete() {
    setErroFrete(null);
    setAvisoFrete(null);
    setCalculandoFrete(true);
    setOpcoesFrete([]);
    setFreteSelecionado(null);
    setFreteGratisAplicado(false);

    try {
      const resposta = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep, items }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErroFrete(dados.error ?? "Não foi possível calcular o frete.");
        return;
      }

      setOpcoesFrete(dados.opcoes);
      setAvisoFrete(dados.avisoFrete ?? null);
      setFreteGratisAplicado(Boolean(dados.freteGratis));
      if (dados.freteGratis && dados.opcoes?.[0]) {
        setFreteSelecionado(dados.opcoes[0]);
      }
    } catch {
      setErroFrete("Não foi possível calcular o frete agora. Tente novamente.");
    } finally {
      setCalculandoFrete(false);
    }
  }

  async function handleFinish() {
    if (!freteSelecionado) {
      setErroSubmit("Volte à etapa de entrega e escolha uma opção de frete.");
      return;
    }

    setErroSubmit(null);
    setSubmitting(true);

    try {
      const resposta = await fetch("/api/mercadopago/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod,
          customerName,
          cpf,
          phone,
          address: { cep, street, numero, complemento, city, state: stateUf },
          frete: {
            valorCentavos: freteSelecionado.precoComDescontoCents,
            nome: freteSelecionado.nome,
            servicoId: freteSelecionado.id,
            prazoDias: freteSelecionado.prazoDias,
          },
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErroSubmit(dados.error ?? "Não foi possível finalizar o pedido.");
        setSubmitting(false);
        return;
      }

      clear();

      if (dados.initPoint) {
        window.location.href = dados.initPoint;
      } else {
        router.push(`/pedido/confirmacao?id=${dados.orderId}`);
      }
    } catch {
      setErroSubmit("Não foi possível finalizar o pedido. Tente novamente.");
      setSubmitting(false);
    }
  }

  const steps: { id: Step; label: string }[] = [
    { id: 1, label: "Dados" },
    { id: 2, label: "Entrega" },
    { id: 3, label: "Pagamento" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Finalizar compra</h1>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="flex flex-col gap-4">
          {steps.map((s) => {
            const isOpen = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="rounded-2xl border border-border bg-surface overflow-hidden">
                <button
                  onClick={() => (isDone || isOpen ? setStep(s.id) : undefined)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left"
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                      isDone ? "bg-success text-white" : isOpen ? "bg-brand text-white" : "bg-[#eef0f3] text-muted"
                    }`}
                  >
                    {isDone ? "✓" : s.id}
                  </span>
                  <span className="font-semibold text-foreground">{s.label}</span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 flex flex-col gap-3 border-t border-border pt-4">
                    {s.id === 1 && (
                      <>
                        <input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Nome completo"
                          className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                        />
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="E-mail"
                          type="email"
                          className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="CPF"
                            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                          />
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Telefone / WhatsApp"
                            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                          />
                        </div>
                        <button
                          disabled={!dadosValid}
                          onClick={() => setStep(2)}
                          className="mt-1 inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-brand-foreground font-semibold h-11 text-sm w-fit px-6 transition-colors"
                        >
                          Continuar para entrega
                        </button>
                      </>
                    )}

                    {s.id === 2 && (
                      <>
                        <input
                          value={cep}
                          onChange={(e) => {
                            setCep(e.target.value);
                            buscarEnderecoPorCep(e.target.value);
                          }}
                          placeholder="CEP"
                          className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand max-w-[200px]"
                        />
                        {buscandoCep && <p className="text-xs text-muted">Buscando endereço…</p>}
                        {cepEncontrado && (
                          <p className="text-xs text-success">✓ {cepEncontrado} — confira e complete o número</p>
                        )}
                        <input
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Endereço (rua, avenida)"
                          className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                        />
                        <div className="grid grid-cols-[100px_1fr] gap-3">
                          <input
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            placeholder="Número"
                            required
                            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                          />
                          <input
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                            placeholder="Complemento (apto, bloco — opcional)"
                            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                          />
                        </div>
                        <div className="grid grid-cols-[1fr_100px] gap-3">
                          <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Cidade"
                            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                          />
                          <input
                            value={stateUf}
                            onChange={(e) => setStateUf(e.target.value.toUpperCase().slice(0, 2))}
                            placeholder="UF"
                            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                          />
                        </div>

                        <button
                          onClick={calcularFrete}
                          disabled={cep.replace(/\D/g, "").length !== 8 || calculandoFrete}
                          className="inline-flex items-center justify-center rounded-full border border-border hover:border-brand disabled:opacity-40 h-10 text-sm font-medium w-fit px-5 transition-colors"
                        >
                          {calculandoFrete ? "Calculando frete…" : "Calcular frete"}
                        </button>

                        {erroFrete && <p className="text-sm text-red-600">{erroFrete}</p>}

                        {freteGratisAplicado && freteSelecionado?.precoComDescontoCents === 0 && (
                          <p className="rounded-lg bg-success-light px-3 py-2 text-sm font-medium text-success">
                            🎉 Frete grátis pelo PAC nesse pedido!
                          </p>
                        )}

                        {avisoFrete && (
                          <p className="rounded-lg bg-brand-light px-3 py-2 text-xs text-brand-dark">{avisoFrete}</p>
                        )}

                        {opcoesFrete.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {opcoesFrete.map((opcao) => (
                              <label
                                key={opcao.id}
                                className={`flex items-center justify-between rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                                  freteSelecionado?.id === opcao.id ? "border-brand bg-brand-light" : "border-border"
                                }`}
                              >
                                <span className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="frete"
                                    checked={freteSelecionado?.id === opcao.id}
                                    onChange={() => setFreteSelecionado(opcao)}
                                    className="accent-[color:var(--brand)]"
                                  />
                                  <span className="flex flex-col">
                                    <span className="text-sm font-semibold text-foreground">
                                      {opcao.transportadora} — {opcao.nome}
                                    </span>
                                    <span className="text-xs text-muted">{opcao.prazoDias} dias úteis</span>
                                  </span>
                                </span>
                                <span className={`text-sm font-semibold ${opcao.precoComDescontoCents === 0 ? "text-success" : "text-foreground"}`}>
                                  {opcao.precoComDescontoCents === 0 ? "Grátis" : formatBRL(opcao.precoComDescontoCents)}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                        <button
                          disabled={!enderecoValid || !freteSelecionado}
                          onClick={() => setStep(3)}
                          className="mt-1 inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-brand-foreground font-semibold h-11 text-sm w-fit px-6 transition-colors"
                        >
                          Continuar para pagamento
                        </button>
                      </>
                    )}

                    {s.id === 3 && (
                      <>
                        <div className="flex flex-col gap-2">
                          {(
                            [
                              { id: "pix" as const, label: "Pix", hint: "aprovação na hora, com desconto" },
                              { id: "boleto" as const, label: "Boleto", hint: "compensação em até 2 dias úteis" },
                              { id: "cartao" as const, label: "Cartão de crédito", hint: "parcele em até 18x" },
                            ]
                          ).map((m) => (
                            <label
                              key={m.id}
                              className={`flex items-center justify-between rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                                paymentMethod === m.id ? "border-brand bg-brand-light" : "border-border"
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="payment"
                                  checked={paymentMethod === m.id}
                                  onChange={() => setPaymentMethod(m.id)}
                                  className="accent-[color:var(--brand)]"
                                />
                                <span className="flex flex-col">
                                  <span className="text-sm font-semibold text-foreground">{m.label}</span>
                                  <span className="text-xs text-muted">{m.hint}</span>
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>

                        <div className="rounded-lg bg-[#f7f8fa] px-4 py-3 text-xs text-muted">
                          Você será redirecionado ao <strong>Mercado Pago</strong> para concluir o pagamento com
                          segurança.
                          {paymentMethod === "cartao" &&
                            " As opções de parcelamento e os juros de cada cartão aparecem lá, na hora de pagar."}
                        </div>

                        {erroSubmit && (
                          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erroSubmit}</p>
                        )}

                        <button
                          onClick={handleFinish}
                          disabled={submitting}
                          className="mt-1 inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-brand-foreground font-semibold h-12 text-sm w-full transition-colors"
                        >
                          {submitting ? "Processando…" : "Finalizar pedido"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 h-fit">
          <h2 className="text-sm font-semibold text-foreground">Resumo</h2>
          {items.map((item) => {
            const { product, variant } = resolveCartLine(item);
            if (!product || !variant) return null;
            return (
              <div key={item.variantId} className="flex justify-between text-sm text-muted">
                <span className="line-clamp-2 max-w-[70%]">
                  {item.quantity}x {product.name}
                </span>
                <span className="tabular-nums shrink-0">{formatBRL(variant.priceCents * item.quantity)}</span>
              </div>
            );
          })}
          {freteSelecionado && (
            <div className="flex justify-between text-sm text-muted">
              <span>Frete — {freteSelecionado.nome}</span>
              <span className={`tabular-nums ${freteSelecionado.precoComDescontoCents === 0 ? "text-success font-medium" : ""}`}>
                {freteSelecionado.precoComDescontoCents === 0 ? "Grátis" : formatBRL(freteSelecionado.precoComDescontoCents)}
              </span>
            </div>
          )}
          <div className="h-px bg-border" />
          <div className="flex justify-between text-base font-bold text-foreground">
            <span>Total</span>
            <span className="tabular-nums">
              {formatBRL(paymentMethod === "pix" ? pixTotal : paymentMethod === "cartao" ? cardTotal : totalCents + freteCents)}
            </span>
          </div>
        </div>
      </div>

      <CheckoutComboSuggestions />
    </div>
  );
}