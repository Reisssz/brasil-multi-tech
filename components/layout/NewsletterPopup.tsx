"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bmt_newsletter_dismissed";
const SHOW_DELAY_MS = 5000;

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  function close() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !consent) return;
    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, "1");
    setTimeout(() => setVisible(false), 1800);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="animate-pop-in relative w-full max-w-md rounded-2xl bg-surface shadow-2xl p-6">
        <button
          onClick={close}
          aria-label="Fechar"
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full text-muted hover:bg-[#f0f1f3] hover:text-foreground transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        {submitted ? (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-success-light text-success">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h2 className="font-display text-xl font-bold text-foreground">Cadastro realizado!</h2>
            <p className="text-sm text-muted">
              Fique de olho no seu e-mail — seu cupom exclusivo chega em instantes.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 pr-8">
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 5h16v11a1 1 0 0 1-1 1H8l-4 3.5V5Z"
                    stroke="var(--brand-foreground)"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path d="M8 9.5h8M8 12.5h5" stroke="var(--brand-foreground)" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground leading-tight">
                  Quer receber as melhores ofertas?
                </h2>
                <p className="text-sm text-muted mt-1">
                  Cadastre-se agora e receba um cupom exclusivo para economizar na Brasil Multi Tech.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-5">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome"
                className="h-12 rounded-xl bg-[#f5f6f8] border border-transparent focus:border-brand focus:bg-white px-4 text-sm outline-none transition-colors"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="h-12 rounded-xl bg-[#f5f6f8] border border-transparent focus:border-brand focus:bg-white px-4 text-sm outline-none transition-colors"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="h-12 rounded-xl bg-[#f5f6f8] border border-transparent focus:border-brand focus:bg-white px-4 text-sm outline-none transition-colors"
              />

              <label className="flex items-start gap-2.5 mt-1 text-xs text-muted leading-relaxed cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-[color:var(--brand)] shrink-0"
                />
                Aceito receber ofertas, novidades e comunicações da Brasil Multi Tech.
              </label>

              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-bold text-sm h-12 transition-colors active:scale-95"
              >
                Quero Aproveitar
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
