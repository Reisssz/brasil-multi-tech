"use client";

import { useState } from "react";
import Link from "next/link";
import { formatBRL } from "@/lib/pricing";

type ScreenCondition = "perfeita" | "riscos_leves" | "trincada";
type BodyCondition = "perfeito" | "riscos_leves" | "amassado";
type BatteryHealth = "acima_90" | "entre_80_89" | "abaixo_80" | "nao_sei";

const PECAS_QUEBRADAS = ["Câmera", "Alto-falante", "Microfone", "Botão home/power", "Carregamento", "Biometria/Face ID"];
const PECAS_TROCADAS = ["Tela", "Bateria", "Carcaça/Tampa traseira"];

export default function FormularioVender() {
  const [category, setCategory] = useState("celular");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [storageGb, setStorageGb] = useState("");
  const [color, setColor] = useState("");

  const [screenCondition, setScreenCondition] = useState<ScreenCondition>("perfeita");
  const [bodyCondition, setBodyCondition] = useState<BodyCondition>("perfeito");
  const [batteryHealth, setBatteryHealth] = useState<BatteryHealth>("acima_90");
  const [turnsOn, setTurnsOn] = useState(true);
  const [brokenParts, setBrokenParts] = useState<string[]>([]);
  const [replacedParts, setReplacedParts] = useState<string[]>([]);
  const [includesBox, setIncludesBox] = useState(false);
  const [includesCharger, setIncludesCharger] = useState(false);
  const [notes, setNotes] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ valorEstimadoCents: number; precoBaseEncontrado: boolean } | null>(null);

  function alternar(lista: string[], valor: string, set: (v: string[]) => void) {
    set(lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]);
  }

  const formValido =
    brand.trim().length > 1 &&
    model.trim().length > 1 &&
    contactName.trim().length > 2 &&
    contactPhone.trim().length >= 8 &&
    contactEmail.includes("@");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!formValido) {
      setErro("Preencha marca, modelo e seus dados de contato.");
      return;
    }
    setErro(null);
    setEnviando(true);

    try {
      const resposta = await fetch("/api/vender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          brand,
          model,
          storageGb: storageGb ? Number(storageGb) : undefined,
          color,
          screenCondition,
          bodyCondition,
          batteryHealth,
          turnsOn,
          brokenParts,
          replacedParts,
          includesBox,
          includesCharger,
          notes,
          contactName,
          contactPhone,
          contactEmail,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error ?? "Não foi possível enviar. Tente novamente.");
        return;
      }

      setResultado(dados);
    } catch {
      setErro("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-light text-success mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Recebemos sua solicitação!</h1>
        <p className="text-muted mb-6">Pelo que você respondeu, seu aparelho está estimado em:</p>

        <div className="rounded-2xl border-2 border-brand bg-brand-light p-6 mb-6">
          <span className="text-xs uppercase tracking-wide text-brand-dark font-semibold">Estimativa de valor</span>
          <p className="font-display text-4xl font-bold text-foreground mt-1">
            até {formatBRL(resultado.valorEstimadoCents)}
          </p>
        </div>

        <p className="text-sm text-muted leading-relaxed mb-8">
          Esse valor é uma estimativa inicial. Nossa equipe vai entrar em contato pelo telefone ou e-mail
          informado para confirmar os detalhes e combinar os próximos passos — o valor final é confirmado
          depois da avaliação física do aparelho.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 px-6 text-sm transition-colors"
        >
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">Vamos começar!</h1>
      <p className="text-muted mb-8">Informe os detalhes do seu aparelho para calcularmos uma estimativa.</p>

      <form onSubmit={enviar} className="flex flex-col gap-8">
        {/* Especificações */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Especificações do aparelho</h2>

          <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
            Tipo de aparelho
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-lg border border-border px-3 text-sm">
              <option value="celular">Celular</option>
              <option value="notebook">Notebook / Tablet</option>
              <option value="smartwatch">Smartwatch</option>
              <option value="outro">Outro</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Marca" value={brand} onChange={setBrand} placeholder="Ex: Apple, Samsung" required />
            <Campo label="Modelo" value={model} onChange={setModel} placeholder="Ex: iPhone 12, Galaxy S23" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
              Armazenamento
              <select value={storageGb} onChange={(e) => setStorageGb(e.target.value)} className="h-11 rounded-lg border border-border px-3 text-sm">
                <option value="">Não sei / não se aplica</option>
                <option value="32">32GB</option>
                <option value="64">64GB</option>
                <option value="128">128GB</option>
                <option value="256">256GB</option>
                <option value="512">512GB</option>
                <option value="1024">1TB</option>
              </select>
            </label>
            <Campo label="Cor" value={color} onChange={setColor} placeholder="Ex: Preto" />
          </div>
        </section>

        {/* Condição */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Condição do aparelho</h2>

          <Radio
            label="Como está a tela?"
            value={screenCondition}
            onChange={(v) => setScreenCondition(v as ScreenCondition)}
            options={[
              { value: "perfeita", label: "Perfeita, sem riscos" },
              { value: "riscos_leves", label: "Riscos leves" },
              { value: "trincada", label: "Trincada ou quebrada" },
            ]}
          />

          <Radio
            label="Como está a carcaça (parte de trás e laterais)?"
            value={bodyCondition}
            onChange={(v) => setBodyCondition(v as BodyCondition)}
            options={[
              { value: "perfeito", label: "Perfeita, sem riscos" },
              { value: "riscos_leves", label: "Riscos leves" },
              { value: "amassado", label: "Amassada ou trincada" },
            ]}
          />

          <Radio
            label="Saúde da bateria"
            value={batteryHealth}
            onChange={(v) => setBatteryHealth(v as BatteryHealth)}
            options={[
              { value: "acima_90", label: "Acima de 90%" },
              { value: "entre_80_89", label: "Entre 80% e 89%" },
              { value: "abaixo_80", label: "Abaixo de 80%" },
              { value: "nao_sei", label: "Não sei" },
            ]}
          />

          <Radio
            label="O aparelho liga e funciona normalmente?"
            value={turnsOn ? "sim" : "nao"}
            onChange={(v) => setTurnsOn(v === "sim")}
            options={[
              { value: "sim", label: "Sim, funciona normalmente" },
              { value: "nao", label: "Não liga ou tem defeito grave" },
            ]}
          />

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Alguma dessas peças está quebrada ou com defeito?</p>
            <div className="flex flex-wrap gap-2">
              {PECAS_QUEBRADAS.map((peca) => (
                <Chip
                  key={peca}
                  label={peca}
                  ativo={brokenParts.includes(peca)}
                  onClick={() => alternar(brokenParts, peca, setBrokenParts)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Alguma peça já foi trocada (fora da autorizada)?</p>
            <div className="flex flex-wrap gap-2">
              {PECAS_TROCADAS.map((peca) => (
                <Chip
                  key={peca}
                  label={peca}
                  ativo={replacedParts.includes(peca)}
                  onClick={() => alternar(replacedParts, peca, setReplacedParts)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={includesBox} onChange={(e) => setIncludesBox(e.target.checked)} />
              Tenho a caixa original
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={includesCharger} onChange={(e) => setIncludesCharger(e.target.checked)} />
              Tenho o carregador
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
            Alguma outra informação relevante? (opcional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="Ex: comprado em loja autorizada, nota fiscal disponível, etc."
            />
          </label>
        </section>

        {/* Contato */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Seus dados de contato</h2>
          <Campo label="Nome completo" value={contactName} onChange={setContactName} required />
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Telefone / WhatsApp" value={contactPhone} onChange={setContactPhone} required />
            <Campo label="E-mail" value={contactEmail} onChange={setContactEmail} type="email" required />
          </div>
        </section>

        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-brand-foreground font-bold text-sm transition-colors"
        >
          {enviando ? "Calculando…" : "Ver estimativa de valor"}
        </button>
      </form>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
        className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}

function Radio({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-col gap-1.5">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
              value === o.value ? "border-brand bg-brand-light" : "border-border"
            }`}
          >
            <input type="radio" checked={value === o.value} onChange={() => onChange(o.value)} className="accent-[color:var(--brand)]" />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function Chip({ label, ativo, onClick }: { label: string; ativo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        ativo ? "border-brand bg-brand text-brand-foreground" : "border-border text-muted"
      }`}
    >
      {label}
    </button>
  );
}
