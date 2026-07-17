"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, resolveCartLine } from "@/lib/cart-context";
import { calculateInstallment, formatBRL, getInstallmentOptions, getPixPriceCents } from "@/lib/pricing";
import { createOrder, PaymentMethod } from "@/lib/orders";

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const { items, totalCents, clear } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [installments, setInstallments] = useState(1);

  const dadosValid = customerName.trim().length > 2 && email.includes("@") && cpf.trim().length >= 11;
  const enderecoValid = cep.trim().length >= 8 && street.trim().length > 3 && city.trim().length > 1 && stateUf.trim().length === 2;

  const pixTotal = getPixPriceCents(totalCents);
  const installmentOptions = getInstallmentOptions(totalCents);
  const cardResult = calculateInstallment(totalCents, installments);

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

  function handleFinish() {
    setSubmitting(true);
    const order = createOrder({
      items,
      totalCents: paymentMethod === "pix" ? pixTotal : paymentMethod === "cartao" ? cardResult.totalCents : totalCents,
      paymentMethod,
      installments: paymentMethod === "cartao" ? installments : 1,
      customerName,
      address: { cep, street, city, state: stateUf },
    });
    clear();
    router.push(`/pedido/confirmacao?id=${order.id}`);
  }

  const steps: { id: Step; label: string }[] = [
    { id: 1, label: "Dados" },
    { id: 2, label: "Entrega" },
    { id: 3, label: "Pagamento" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Finalizar compra</h1>

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
                          onChange={(e) => setCep(e.target.value)}
                          placeholder="CEP"
                          className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand max-w-[200px]"
                        />
                        <input
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Endereço, número e complemento"
                          className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                        />
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
                          disabled={!enderecoValid}
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

                        {paymentMethod === "cartao" && (
                          <select
                            value={installments}
                            onChange={(e) => setInstallments(Number(e.target.value))}
                            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
                          >
                            {installmentOptions.map((o) => (
                              <option key={o.count} value={o.count}>
                                {o.count}x de {formatBRL(o.installmentCents)}
                                {o.interestFree ? " sem juros" : " com juros"}
                              </option>
                            ))}
                          </select>
                        )}

                        <div className="rounded-lg bg-[#f7f8fa] px-4 py-3 text-xs text-muted">
                          Pagamento processado via <strong>Mercado Pago</strong>. Ambiente de demonstração — nenhuma
                          cobrança real será feita.
                        </div>

                        <button
                          onClick={handleFinish}
                          className="mt-1 inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-12 text-sm w-full transition-colors"
                        >
                          Finalizar pedido
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
          <div className="h-px bg-border" />
          <div className="flex justify-between text-base font-bold text-foreground">
            <span>Total</span>
            <span className="tabular-nums">
              {formatBRL(
                paymentMethod === "pix" ? pixTotal : paymentMethod === "cartao" ? cardResult.totalCents : totalCents
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
