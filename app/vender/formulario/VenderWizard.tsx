"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatBRL } from "@/lib/pricing";
import {
  calcularOfertas,
  deveRejeitar,
  type MarcasDeUso,
  type OfferType,
  type RespostasEstimativa,
  type SaudeBateria,
} from "@/lib/trade-in/pricing";
import { assinarContrato, definirRecebimento, enviarSolicitacao } from "./actions";
import { StepTracker, type WizardStepId } from "./StepTracker";

const DRAFT_KEY = "bmt_vender_rascunho_v1";

export type TradeInRequestRow = {
  id: string;
  status: string;
  category: string;
  brand: string;
  model: string;
  storage_gb: number | null;
  color: string | null;
  offer_type: OfferType | null;
  estimated_value_cents: number | null;
  final_value_cents: number | null;
  proposal_expires_at: string | null;
  contract_accepted_name: string | null;
  contract_accepted_at: string | null;
  payment_method: "pix" | "transferencia" | null;
  payment_pix_key: string | null;
  payment_bank_details: string | null;
};

interface Props {
  userEmail: string | null;
  perfilNome: string | null;
  perfilTelefone: string | null;
  initialRequest: TradeInRequestRow | null;
}

type LocalStep = "aparelho" | "condicoes" | "oferta";

export function VenderWizard({ userEmail, perfilNome, perfilTelefone, initialRequest }: Props) {
  const router = useRouter();

  // A solicitação "ativa" ignora uma recusada — nesse caso o cliente começa
  // uma nova localmente, como se não houvesse solicitação nenhuma.
  const row = initialRequest && initialRequest.status !== "recusado" ? initialRequest : null;

  const [localStep, setLocalStep] = useState<LocalStep>("aparelho");
  const restauradoRef = useRef(false);

  const [category, setCategory] = useState("celular");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [storageGb, setStorageGb] = useState("");
  const [color, setColor] = useState("");

  const [turnsOn, setTurnsOn] = useState(true);
  const [fazRecebeLigacoes, setFazRecebeLigacoes] = useState(true);
  const [wifiBluetoothOk, setWifiBluetoothOk] = useState(true);
  const [marcasDeUso, setMarcasDeUso] = useState<MarcasDeUso>("nenhuma");
  const [traseiraLateralDanificada, setTraseiraLateralDanificada] = useState(false);
  const [telaDanificada, setTelaDanificada] = useState(false);
  const [biometriaFunciona, setBiometriaFunciona] = useState(true);
  const [cameraComProblema, setCameraComProblema] = useState(false);
  const [saudeBateria, setSaudeBateria] = useState<SaudeBateria>("superior_90");
  const [pecaNaoGenuina, setPecaNaoGenuina] = useState(false);
  const [includesBox, setIncludesBox] = useState(false);
  const [includesCharger, setIncludesCharger] = useState(false);

  // Fixo: só existe a modalidade "Venda Agora" — mantido como constante em
  // vez de removido pra não mexer no formato salvo em trade_in_requests
  // (coluna offer_type) nem no restante do fluxo (contrato, admin).
  const offerType: OfferType = "agora";

  const [contactName, setContactName] = useState(perfilNome ?? "");
  const [contactPhone, setContactPhone] = useState(perfilTelefone ?? "");
  const [contactEmail, setContactEmail] = useState(userEmail ?? "");

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nomeAssinatura, setNomeAssinatura] = useState(row?.contract_accepted_name ?? "");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [assinando, setAssinando] = useState(false);

  const [metodoRecebimento, setMetodoRecebimento] = useState<"pix" | "transferencia">("pix");
  const [detalhesRecebimento, setDetalhesRecebimento] = useState("");
  const [salvandoRecebimento, setSalvandoRecebimento] = useState(false);

  // Restaura um rascunho salvo antes de mandar pro login (só quando não há
  // nenhuma solicitação já registrada no banco).
  useEffect(() => {
    if (row || restauradoRef.current) return;
    restauradoRef.current = true;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      // Hidratação única de um rascunho salvo antes do redirecionamento pro
      // login — não dá pra ler sessionStorage durante o render (quebra no
      // SSR), então precisa ser aqui mesmo, guardado pelo ref acima.
      /* eslint-disable react-hooks/set-state-in-effect */
      if (draft.category) setCategory(draft.category);
      if (draft.brand) setBrand(draft.brand);
      if (draft.model) setModel(draft.model);
      if (draft.storageGb) setStorageGb(draft.storageGb);
      if (draft.color) setColor(draft.color);
      if (typeof draft.turnsOn === "boolean") setTurnsOn(draft.turnsOn);
      if (typeof draft.fazRecebeLigacoes === "boolean") setFazRecebeLigacoes(draft.fazRecebeLigacoes);
      if (typeof draft.wifiBluetoothOk === "boolean") setWifiBluetoothOk(draft.wifiBluetoothOk);
      if (draft.marcasDeUso) setMarcasDeUso(draft.marcasDeUso);
      if (typeof draft.traseiraLateralDanificada === "boolean") setTraseiraLateralDanificada(draft.traseiraLateralDanificada);
      if (typeof draft.telaDanificada === "boolean") setTelaDanificada(draft.telaDanificada);
      if (typeof draft.biometriaFunciona === "boolean") setBiometriaFunciona(draft.biometriaFunciona);
      if (typeof draft.cameraComProblema === "boolean") setCameraComProblema(draft.cameraComProblema);
      if (draft.saudeBateria) setSaudeBateria(draft.saudeBateria);
      if (typeof draft.pecaNaoGenuina === "boolean") setPecaNaoGenuina(draft.pecaNaoGenuina);
      if (typeof draft.includesBox === "boolean") setIncludesBox(draft.includesBox);
      if (typeof draft.includesCharger === "boolean") setIncludesCharger(draft.includesCharger);
      if (draft.contactName) setContactName(draft.contactName);
      if (draft.contactPhone) setContactPhone(draft.contactPhone);
      if (draft.contactEmail) setContactEmail(draft.contactEmail);
      setLocalStep("oferta");
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      // rascunho corrompido — segue com o formulário em branco
    }
  }, [row]);

  useEffect(() => {
    if (row) return;
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          category, brand, model, storageGb, color,
          turnsOn, fazRecebeLigacoes, wifiBluetoothOk, marcasDeUso,
          traseiraLateralDanificada, telaDanificada, biometriaFunciona, cameraComProblema,
          saudeBateria, pecaNaoGenuina, includesBox, includesCharger, offerType,
          contactName, contactPhone, contactEmail,
        })
      );
    } catch {
      // localStorage/sessionStorage indisponível (modo privado etc) — sem problema
    }
  }, [
    row, category, brand, model, storageGb, color, turnsOn, fazRecebeLigacoes, wifiBluetoothOk,
    marcasDeUso, traseiraLateralDanificada, telaDanificada, biometriaFunciona, cameraComProblema,
    saudeBateria, pecaNaoGenuina, includesBox, includesCharger, offerType, contactName, contactPhone, contactEmail,
  ]);

  const respostas: RespostasEstimativa = {
    brand, model,
    storageGb: storageGb ? Number(storageGb) : undefined,
    turnsOn, fazRecebeLigacoes, wifiBluetoothOk, marcasDeUso,
    traseiraLateralDanificada, telaDanificada, biometriaFunciona, cameraComProblema,
    saudeBateria, pecaNaoGenuina, includesBox, includesCharger,
  };

  const rejeitado = useMemo(
    () => deveRejeitar({ turnsOn, fazRecebeLigacoes, wifiBluetoothOk }),
    [turnsOn, fazRecebeLigacoes, wifiBluetoothOk]
  );

  const ofertas = useMemo(
    () =>
      calcularOfertas({
        brand, model,
        storageGb: storageGb ? Number(storageGb) : undefined,
        turnsOn, fazRecebeLigacoes, wifiBluetoothOk, marcasDeUso,
        traseiraLateralDanificada, telaDanificada, biometriaFunciona, cameraComProblema,
        saudeBateria, pecaNaoGenuina, includesBox, includesCharger,
      }),
    [
      brand, model, storageGb, turnsOn, fazRecebeLigacoes, wifiBluetoothOk, marcasDeUso,
      traseiraLateralDanificada, telaDanificada, biometriaFunciona, cameraComProblema,
      saudeBateria, pecaNaoGenuina, includesBox, includesCharger,
    ]
  );

  const aparelhoValido = brand.trim().length > 1 && model.trim().length > 1;
  const contatoValido = contactName.trim().length > 2 && contactPhone.trim().length >= 8 && contactEmail.includes("@");

  // Assim que enviada, a solicitação já nasce aceita (o cliente escolhe a
  // modalidade e vê o valor ANTES de enviar) — não existe contraproposta,
  // então qualquer solicitação registrada vai direto pra assinatura do
  // contrato e depois pro checkout, sem etapa de espera no meio.
  let effectiveStep: WizardStepId;
  if (!row) {
    effectiveStep = localStep;
  } else if (!row.contract_accepted_at) {
    effectiveStep = "termos";
  } else {
    effectiveStep = "checkout";
  }

  async function handleEnviarSolicitacao() {
    if (!contatoValido) {
      setErro("Preencha seus dados de contato.");
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const resultado = await enviarSolicitacao({
        ...respostas,
        category,
        color: color || undefined,
        offerType,
        contactName,
        contactPhone,
        contactEmail,
      });

      if ("error" in resultado) {
        if (resultado.error === "login_required") {
          router.push("/login?redirect=/vender/formulario");
          return;
        }
        setErro(resultado.error);
        return;
      }

      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // ok ignorar
      }
      router.refresh();
    } catch {
      setErro("Não foi possível enviar sua solicitação agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleAssinar() {
    if (!row) return;
    if (!aceitouTermos) {
      setErro("Marque que você leu e concorda com os termos.");
      return;
    }
    setErro(null);
    setAssinando(true);
    try {
      const resultado = await assinarContrato(row.id, nomeAssinatura);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      router.refresh();
    } finally {
      setAssinando(false);
    }
  }

  async function handleDefinirRecebimento() {
    if (!row) return;
    setErro(null);
    setSalvandoRecebimento(true);
    try {
      const resultado = await definirRecebimento(row.id, metodoRecebimento, detalhesRecebimento);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      router.refresh();
    } finally {
      setSalvandoRecebimento(false);
    }
  }

  const banner = getBanner(effectiveStep, row, rejeitado);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="rounded-2xl bg-gradient-to-r from-brand to-brand-dark text-brand-foreground px-6 py-5 mb-8">
        <h1 className="font-display text-xl sm:text-2xl font-bold">{banner.title}</h1>
        <p className="text-sm opacity-90 mt-1">{banner.subtitle}</p>
      </div>

      <StepTracker current={effectiveStep} />

      {effectiveStep === "aparelho" && (
        <div className="max-w-xl mx-auto rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-bold text-foreground mb-4">Sobre o aparelho</h2>
          <div className="flex flex-col gap-3">
            <Select
              label="Tipo de aparelho"
              value={category}
              onChange={setCategory}
              options={[
                { value: "celular", label: "Celular" },
                { value: "notebook", label: "Notebook / Tablet" },
                { value: "smartwatch", label: "Smartwatch" },
                { value: "outro", label: "Outro" },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Marca" value={brand} onChange={setBrand} placeholder="Ex: Apple, Samsung" />
              <Campo label="Modelo" value={model} onChange={setModel} placeholder="Ex: iPhone 14 Pro" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Armazenamento"
                value={storageGb}
                onChange={setStorageGb}
                options={[
                  { value: "", label: "Não sei / não se aplica" },
                  { value: "32", label: "32GB" },
                  { value: "64", label: "64GB" },
                  { value: "128", label: "128GB" },
                  { value: "256", label: "256GB" },
                  { value: "512", label: "512GB" },
                  { value: "1024", label: "1TB" },
                ]}
              />
              <Campo label="Cor" value={color} onChange={setColor} placeholder="Ex: Roxo" />
            </div>
          </div>

          <button
            disabled={!aparelhoValido}
            onClick={() => setLocalStep("condicoes")}
            className="mt-5 w-full inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-brand-foreground font-bold text-sm transition-colors"
          >
            Continuar
          </button>

          <LiveEstimateStrip
            show={aparelhoValido}
            brand={brand}
            model={model}
            storageGb={storageGb}
            color={color}
            valorCents={ofertas.agoraCents}
          />
        </div>
      )}

      {effectiveStep === "condicoes" && !row && (
        <div className="grid lg:grid-cols-[220px_1fr_240px] gap-5 items-start">
          <DeviceSummaryCard
            brand={brand}
            model={model}
            storageGb={storageGb ? Number(storageGb) : null}
            color={color}
            onEditar={() => setLocalStep("aparelho")}
          />

          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Condições do Aparelho</h2>
              <span className="text-xs text-muted font-medium">Não / Sim</span>
            </div>

            {rejeitado && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <p className="font-semibold mb-1">Infelizmente não conseguimos comprar esse aparelho.</p>
                <p>
                  Não compramos aparelhos que não ligam ou que não fazem/recebem ligação e também não têm
                  wifi/bluetooth funcionando — nesses casos, quase nenhuma função essencial funciona.
                </p>
              </div>
            )}

            <div className="flex flex-col divide-y divide-border">
              <PerguntaSimNao
                pergunta="O seu aparelho liga?"
                ajuda='É considerado "ligar" o aparelho que a tela acende, o sistema operacional é iniciado e é possível navegar pelo toque na tela.'
                valor={turnsOn}
                onChange={setTurnsOn}
              />
              <PerguntaSimNao
                pergunta="O aparelho faz e recebe ligações através de rede móvel (sem contar chamadas por internet, tipo WhatsApp)?"
                ajuda="Considera-se a realização de ligações usando a rede móvel de telefonia."
                valor={fazRecebeLigacoes}
                onChange={setFazRecebeLigacoes}
              />
              <PerguntaSimNao
                pergunta="A conectividade com wifi e bluetooth está funcionando normalmente?"
                ajuda="O aparelho precisa conseguir se conectar à rede wifi e navegar, e o bluetooth precisa conseguir receber arquivos."
                valor={wifiBluetoothOk}
                onChange={setWifiBluetoothOk}
              />
              <PerguntaOpcoes
                pergunta="Tem marcas de uso?"
                valor={marcasDeUso}
                onChange={(v) => setMarcasDeUso(v as MarcasDeUso)}
                opcoes={[
                  { value: "nenhuma", label: "Não possui marcas de uso" },
                  { value: "levissimas", label: "Marcas quase imperceptíveis" },
                  { value: "visiveis", label: "Marcas visíveis" },
                ]}
              />
              <PerguntaSimNao
                pergunta="O aparelho está com a parte traseira ou laterais trincadas, rachadas, descascando, com peças faltando ou riscadas?"
                valor={traseiraLateralDanificada}
                onChange={setTraseiraLateralDanificada}
              />
              <PerguntaSimNao
                pergunta="O aparelho está com a tela quebrada, trincada, rachada, descascando, manchada ou com riscos?"
                valor={telaDanificada}
                onChange={setTelaDanificada}
              />
              <PerguntaSimNao
                pergunta="O aparelho tem leitor biométrico (digital / Face ID) e é possível cadastrar uma nova biometria?"
                valor={biometriaFunciona}
                onChange={setBiometriaFunciona}
              />
              <PerguntaSimNao
                pergunta="As câmeras do aparelho (frontal e traseira) apresentam algum problema?"
                valor={cameraComProblema}
                onChange={setCameraComProblema}
              />
              <PerguntaOpcoes
                pergunta="Qual o nível de saúde da bateria?"
                valor={saudeBateria}
                onChange={(v) => setSaudeBateria(v as SaudeBateria)}
                opcoes={[
                  { value: "inferior_80", label: "Inferior a 80%" },
                  { value: "entre_80_90", label: "Entre 80% e 90%" },
                  { value: "superior_90", label: "Superior a 90%" },
                ]}
              />
              <PerguntaSimNao
                pergunta="O aparelho mostra alguma mensagem de peça não genuína ou desconhecida?"
                valor={pecaNaoGenuina}
                onChange={setPecaNaoGenuina}
              />
              <div className="flex items-center gap-6 py-3">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={includesBox} onChange={(e) => setIncludesBox(e.target.checked)} />
                  Tenho a caixa original
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={includesCharger} onChange={(e) => setIncludesCharger(e.target.checked)} />
                  Tenho o carregador
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between mt-5">
              <button
                onClick={() => setLocalStep("aparelho")}
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-foreground hover:bg-[#f7f8fa] transition-colors"
              >
                Voltar
              </button>
              <button
                disabled={rejeitado}
                onClick={() => setLocalStep("oferta")}
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-brand-foreground px-6 text-sm font-bold transition-colors"
              >
                Continuar para oferta
              </button>
            </div>
          </div>

          <TipsCard />
        </div>
      )}

      {effectiveStep === "condicoes" && !row && (
        <LiveEstimateStrip
          show={!rejeitado}
          brand={brand}
          model={model}
          storageGb={storageGb}
          color={color}
          valorCents={ofertas.agoraCents}
        />
      )}

      {effectiveStep === "oferta" && (
        <div className="grid lg:grid-cols-[220px_1fr] gap-5 items-start">
          <DeviceSummaryCard
            brand={row?.brand ?? brand}
            model={row?.model ?? model}
            storageGb={row ? row.storage_gb : storageGb ? Number(storageGb) : null}
            color={row?.color ?? color}
            onEditar={!row ? () => setLocalStep("condicoes") : undefined}
          />

          <div className="rounded-2xl border border-border bg-surface p-6">
            {!row && (
              <>
                <h2 className="font-bold text-foreground text-lg mb-1">Sua oferta</h2>
                <p className="text-sm text-muted mb-4">Todas as vendas são seguras e garantidas pela Brasil Multi Tech.</p>
                <div className="max-w-sm mb-6">
                  <OfferCard
                    titulo="Venda Agora"
                    valorCents={ofertas.agoraCents}
                    beneficios={[
                      "Avaliação confirmada assim que recebemos as informações",
                      "Pagamento em até 10 dias corridos",
                      "Compramos em praticamente qualquer condição",
                    ]}
                  />
                </div>

                <h3 className="font-semibold text-foreground text-sm mb-2">Seus dados de contato</h3>
                <div className="flex flex-col gap-3 mb-5">
                  <Campo label="Nome completo" value={contactName} onChange={setContactName} />
                  <div className="grid grid-cols-2 gap-3">
                    <Campo label="Telefone / WhatsApp" value={contactPhone} onChange={setContactPhone} />
                    <Campo label="E-mail" value={contactEmail} onChange={setContactEmail} type="email" />
                  </div>
                </div>

                {erro && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setLocalStep("condicoes")}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-foreground hover:bg-[#f7f8fa] transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    disabled={enviando || !contatoValido}
                    onClick={handleEnviarSolicitacao}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-brand-foreground px-6 text-sm font-bold transition-colors"
                  >
                    {enviando ? "Enviando…" : "Enviar solicitação"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {effectiveStep === "termos" && row && (
        <div className="grid lg:grid-cols-[220px_1fr] gap-5 items-start">
          <DeviceSummaryCard brand={row.brand} model={row.model} storageGb={row.storage_gb} color={row.color} />

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-bold text-foreground text-lg mb-4">Termos da venda</h2>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-[#f7f8fa] p-4 text-sm text-foreground leading-relaxed mb-4">
              <p className="font-semibold mb-2">Termo de Aceite de Venda de Aparelho Usado</p>
              <p className="mb-2">
                Pelo presente termo, eu declaro ser o legítimo proprietário do aparelho{" "}
                <strong>{row.brand} {row.model}{row.storage_gb ? ` ${row.storage_gb}GB` : ""}{row.color ? `, cor ${row.color}` : ""}</strong>,
                e concordo em vendê-lo à Brasil Multi Tech pelo valor de{" "}
                <strong>{formatBRL(row.final_value_cents ?? row.estimated_value_cents ?? 0)}</strong>, com pagamento
                em até 10 dias corridos.
              </p>
              <p className="mb-2">
                Declaro que as informações fornecidas sobre o estado do aparelho são verdadeiras, e estou ciente de que
                o valor final pode ser ajustado caso a inspeção física identifique divergências relevantes.
              </p>
              <p>
                O pagamento será feito na forma escolhida na etapa seguinte, e as instruções de envio do aparelho serão
                enviadas por e-mail ou WhatsApp, sem custo para o vendedor.
              </p>
            </div>

            <Campo label="Nome completo (assinatura)" value={nomeAssinatura} onChange={setNomeAssinatura} placeholder="Digite seu nome completo" />

            <label className="flex items-start gap-2 text-sm text-foreground mt-3 mb-4">
              <input type="checkbox" checked={aceitouTermos} onChange={(e) => setAceitouTermos(e.target.checked)} className="mt-0.5" />
              Li e concordo com os termos acima.
            </label>

            {erro && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-foreground hover:bg-[#f7f8fa] transition-colors"
              >
                Imprimir / salvar PDF
              </button>
              <button
                disabled={assinando || !aceitouTermos || nomeAssinatura.trim().length < 3}
                onClick={handleAssinar}
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-brand-foreground px-6 text-sm font-bold transition-colors"
              >
                {assinando ? "Assinando…" : "Assinar e continuar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {effectiveStep === "checkout" && row && (
        <div className="grid lg:grid-cols-[220px_1fr] gap-5 items-start">
          <DeviceSummaryCard brand={row.brand} model={row.model} storageGb={row.storage_gb} color={row.color} />

          <div className="rounded-2xl border border-border bg-surface p-6">
            {row.status === "concluido" ? (
              <div className="text-center py-8">
                <h2 className="font-bold text-foreground text-lg mb-2">Venda concluída 🎉</h2>
                <p className="text-sm text-muted">Obrigado por vender seu aparelho pra Brasil Multi Tech!</p>
              </div>
            ) : row.payment_method ? (
              <div className="text-center py-6">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-light text-success mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h2 className="font-bold text-foreground text-lg mb-2">Tudo certo!</h2>
                <p className="text-sm text-muted max-w-sm mx-auto mb-1">
                  Você vai receber por{" "}
                  <strong>{row.payment_method === "pix" ? "Pix" : "transferência bancária"}</strong> assim que recebermos e
                  confirmarmos o aparelho.
                </p>
                <p className="text-sm text-muted max-w-sm mx-auto">
                  Depois que sua proposta é aceita, orientamos sobre a forma de envio ou entrega, sem custo para você.
                  Fique de olho no seu e-mail e WhatsApp.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-foreground text-lg mb-4">Como você quer receber?</h2>
                <div className="flex flex-col gap-2 mb-4">
                  {(
                    [
                      { id: "pix" as const, label: "Pix", hint: "recebimento mais rápido" },
                      { id: "transferencia" as const, label: "Transferência bancária", hint: "TED/DOC para sua conta" },
                    ]
                  ).map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                        metodoRecebimento === m.id ? "border-brand bg-brand-light" : "border-border"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="metodoRecebimento"
                          checked={metodoRecebimento === m.id}
                          onChange={() => setMetodoRecebimento(m.id)}
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

                <Campo
                  label={metodoRecebimento === "pix" ? "Chave Pix" : "Dados bancários (banco, agência, conta, titular)"}
                  value={detalhesRecebimento}
                  onChange={setDetalhesRecebimento}
                  placeholder={metodoRecebimento === "pix" ? "CPF, e-mail, telefone ou chave aleatória" : "Ex: Banco 001, Ag 1234, CC 56789-0"}
                />

                {erro && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}

                <button
                  disabled={salvandoRecebimento || detalhesRecebimento.trim().length < 4}
                  onClick={handleDefinirRecebimento}
                  className="mt-5 w-full inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-brand-foreground font-bold text-sm transition-colors"
                >
                  {salvandoRecebimento ? "Salvando…" : "Confirmar e finalizar"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getBanner(step: WizardStepId, row: TradeInRequestRow | null, rejeitado: boolean) {
  if (step === "aparelho") return { title: "Vamos começar!", subtitle: "Conte pra gente qual aparelho você quer vender." };
  if (step === "condicoes") {
    return rejeitado
      ? { title: "Ops!", subtitle: "Esse aparelho não é elegível para compra — veja o motivo abaixo." }
      : { title: "Estamos avançando!", subtitle: "Só precisamos de algumas informações rápidas." };
  }
  if (step === "oferta") return { title: "Sua oferta está pronta!", subtitle: "Escolha como prefere vender." };
  if (step === "termos") return { title: "Proposta aceita!", subtitle: "Leia e assine os termos da venda para formalizar." };
  if (row?.status === "concluido") return { title: "Concluído!", subtitle: "Essa venda já foi finalizada." };
  if (row?.payment_method) return { title: "Tudo certo!", subtitle: "Assim que recebermos o aparelho, seguimos com o pagamento." };
  return { title: "Quase lá!", subtitle: "Escolha como deseja receber o pagamento." };
}

function LiveEstimateStrip({
  show, brand, model, storageGb, color, valorCents,
}: {
  show: boolean; brand: string; model: string; storageGb: string; color: string; valorCents: number;
}) {
  if (!show) return null;
  return (
    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-brand bg-brand-light px-4 py-3">
      <div className="text-xs text-brand-dark">
        <span className="font-semibold">{brand} {model}</span>
        {storageGb && <span> · {storageGb}GB</span>}
        {color && <span> · {color}</span>}
      </div>
      <div className="text-sm">
        <span className="text-muted mr-1">Estimativa:</span>
        <span className="font-bold text-foreground">até {formatBRL(valorCents)}</span>
      </div>
    </div>
  );
}

function DeviceSummaryCard({
  brand, model, storageGb, color, onEditar,
}: {
  brand: string; model: string; storageGb: number | null; color: string | null; onEditar?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <span className="block text-[11px] uppercase tracking-wide text-muted font-semibold mb-1">Seu aparelho</span>
      <p className="font-bold text-foreground text-sm leading-snug">
        {brand} {model}
        {storageGb ? ` · ${storageGb}GB` : ""}
      </p>
      {color && <p className="text-xs text-muted mt-0.5">{color}</p>}
      {onEditar && (
        <button onClick={onEditar} className="mt-3 text-xs font-semibold text-brand-dark hover:underline">
          Editar aparelho
        </button>
      )}
    </div>
  );
}

function OfferCard({
  titulo, valorCents, beneficios,
}: {
  titulo: string; valorCents: number; beneficios: string[];
}) {
  return (
    <div className="rounded-2xl border-2 border-brand p-5 flex flex-col">
      <span className="font-bold text-brand-dark text-sm mb-1">{titulo}</span>
      <span className="font-display text-2xl font-bold text-foreground mb-3">{formatBRL(valorCents)}</span>
      <ul className="flex flex-col gap-2">
        {beneficios.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs text-muted">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-brand-dark">
              <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TipsCard() {
  const dicas = [
    {
      pergunta: "Arranhões leves desvalorizam muito o celular?",
      resposta: "Não. Pequenas marcas de uso são esperadas. Trincas na tela ou na carcaça pesam mais.",
    },
    {
      pergunta: "E se a bateria estiver ruim, ainda consigo vender?",
      resposta: "Sim! Basta informar a saúde da bateria — o valor é ajustado automaticamente.",
    },
    {
      pergunta: "Meu aparelho não liga ou quase não funciona, posso vender?",
      resposta: "Nesses casos específicos infelizmente não compramos — mas qualquer outro defeito, sem problema.",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 hidden lg:flex flex-col gap-4">
      <h3 className="text-sm font-bold text-foreground">Dicas rápidas de preenchimento</h3>
      {dicas.map((d, i) => (
        <div key={d.pergunta} className="flex gap-2">
          <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-brand-dark text-[11px] font-bold">
            {i + 1}
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">{d.pergunta}</p>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">{d.resposta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PerguntaSimNao({
  pergunta, ajuda, valor, onChange,
}: {
  pergunta: string; ajuda?: string; valor: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{pergunta}</p>
        {ajuda && <p className="text-xs text-muted mt-0.5 leading-relaxed">{ajuda}</p>}
      </div>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`h-8 rounded-full px-3 text-xs font-bold transition-colors ${
            !valor ? "bg-brand text-brand-foreground" : "bg-[#eef0f3] text-muted"
          }`}
        >
          Não
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`h-8 rounded-full px-3 text-xs font-bold transition-colors ${
            valor ? "bg-brand text-brand-foreground" : "bg-[#eef0f3] text-muted"
          }`}
        >
          Sim
        </button>
      </div>
    </div>
  );
}

function PerguntaOpcoes({
  pergunta, valor, onChange, opcoes,
}: {
  pergunta: string; valor: string; onChange: (v: string) => void; opcoes: { value: string; label: string }[];
}) {
  return (
    <div className="py-3">
      <p className="text-sm font-semibold text-foreground mb-2">{pergunta}</p>
      <div className="flex flex-wrap gap-1.5">
        {opcoes.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`h-8 rounded-full px-3 text-xs font-bold transition-colors ${
              valor === o.value ? "bg-brand text-brand-foreground" : "bg-[#eef0f3] text-muted"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Campo({
  label, value, onChange, ...props
}: {
  label: string; value: string; onChange: (v: string) => void;
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

function Select({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-lg border border-border px-3 text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
