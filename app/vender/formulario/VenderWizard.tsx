"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatBRL } from "@/lib/pricing";
import {
  buildCatalogo,
  calcularOfertas,
  deveRejeitar,
  type CatalogoPrecos,
  type MarcasDeUso,
  type OfferType,
  type RespostasEstimativa,
  type SaudeBateria,
} from "@/lib/trade-in/pricing";
import { createClient } from "@/lib/supabase/client";
import {
  assinarContrato,
  definirMetodoEnvio,
  definirRecebimento,
  enviarDocumentoIdentidade,
  enviarSolicitacao,
  registrarRastreioCorreios,
  type MetodoEnvioTradeIn,
} from "./actions";
import { StepTracker, type WizardStepId } from "./StepTracker";
import { SITE, whatsappLink } from "@/lib/config";

const DRAFT_KEY = "bmt_vender_rascunho_v1";
const REGEX_IMEI = /^\d{15}$/;

/** Catálogo curado (botões de seleção — item 01 do relatório de ajustes). "Outro/Outra" sempre revela um campo livre pra não travar quem tem um modelo fora da lista. */
const MARCAS_SUGERIDAS = ["Apple", "Samsung", "Motorola", "Xiaomi"];
const CORES_SUGERIDAS = ["Preto", "Branco", "Prata", "Dourado", "Azul", "Verde", "Roxo", "Rosa"];

export type TradeInRequestRow = {
  id: string;
  status: string;
  category: string;
  brand: string;
  model: string;
  storage_gb: number | null;
  color: string | null;
  imei: string | null;
  imei2: string | null;
  offer_type: OfferType | null;
  estimated_value_cents: number | null;
  final_value_cents: number | null;
  proposal_expires_at: string | null;
  contract_accepted_name: string | null;
  contract_accepted_at: string | null;
  documento_selfie_uploaded_at: string | null;
  payment_method: "pix" | "transferencia" | null;
  payment_pix_key: string | null;
  payment_bank_details: string | null;
  shipping_method: MetodoEnvioTradeIn | null;
  shipping_tracking_code: string | null;
  process_stage: string | null;
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

  useEffect(() => {
    if (!row?.payment_method) return;
    const interval = window.setInterval(() => router.refresh(), 30000);
    return () => window.clearInterval(interval);
  }, [router, row?.id, row?.payment_method]);

  const [localStep, setLocalStep] = useState<LocalStep>("aparelho");
  const restauradoRef = useRef(false);

  const [category, setCategory] = useState("celular");
  const [brand, setBrand] = useState("");
  const [brandOutra, setBrandOutra] = useState("");
  const [model, setModel] = useState("");
  const [modelOutro, setModelOutro] = useState("");
  const [storageGb, setStorageGb] = useState("");
  const [color, setColor] = useState("");
  const [colorOutra, setColorOutra] = useState("");
  const [imei, setImei] = useState("");
  const [imei2, setImei2] = useState("");

  const [linhasCatalogo, setLinhasCatalogo] = useState<{ brand: string; model: string; valor_cents: number }[]>([]);
  const catalogo: CatalogoPrecos = useMemo(() => buildCatalogo(linhasCatalogo), [linhasCatalogo]);
  const modelosDaMarca = useMemo(
    () => linhasCatalogo.filter((l) => l.brand.toLowerCase() === brand.toLowerCase()).map((l) => l.model),
    [linhasCatalogo, brand]
  );

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("trade_in_base_prices")
      .select("brand, model, valor_cents")
      .then(({ data }) => setLinhasCatalogo(data ?? []));
  }, []);

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
  const [hasInvoice, setHasInvoice] = useState(false);

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
  const [metodoEnvio, setMetodoEnvio] = useState<MetodoEnvioTradeIn>(row?.shipping_method ?? "correios");
  const [codigoRastreio, setCodigoRastreio] = useState("");
  const [salvandoRecebimento, setSalvandoRecebimento] = useState(false);

  const [arquivoDocumento, setArquivoDocumento] = useState<File | null>(null);
  const [previewDocumento, setPreviewDocumento] = useState<string | null>(null);
  const [enviandoDocumento, setEnviandoDocumento] = useState(false);
  const [erroDocumento, setErroDocumento] = useState<string | null>(null);

  // Restaura um rascunho salvo antes de mandar pro login (só quando não há
  // nenhuma solicitação já registrada no banco).
  useEffect(() => {
    if (row || restauradoRef.current) return;
    restauradoRef.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      // Hidratação única de um rascunho salvo antes do redirecionamento pro
      // login — não dá pra ler localStorage durante o render (quebra no
      // SSR), então precisa ser aqui mesmo, guardado pelo ref acima.
      /* eslint-disable react-hooks/set-state-in-effect */
      if (draft.category) setCategory(draft.category);
      if (draft.brand) setBrand(draft.brand);
      if (draft.brandOutra) setBrandOutra(draft.brandOutra);
      if (draft.model) setModel(draft.model);
      if (draft.modelOutro) setModelOutro(draft.modelOutro);
      if (draft.storageGb) setStorageGb(draft.storageGb);
      if (draft.color) setColor(draft.color);
      if (draft.colorOutra) setColorOutra(draft.colorOutra);
      if (draft.imei) setImei(draft.imei);
      if (draft.imei2) setImei2(draft.imei2);
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
      if (typeof draft.hasInvoice === "boolean") setHasInvoice(draft.hasInvoice);
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
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          category, brand, brandOutra, model, modelOutro, storageGb, color, colorOutra, imei, imei2,
          turnsOn, fazRecebeLigacoes, wifiBluetoothOk, marcasDeUso,
          traseiraLateralDanificada, telaDanificada, biometriaFunciona, cameraComProblema,
          saudeBateria, pecaNaoGenuina, includesBox, hasInvoice, offerType,
          contactName, contactPhone, contactEmail,
        })
      );
    } catch {
      // localStorage indisponível (modo privado etc) — sem problema
    }
  }, [
    row, category, brand, brandOutra, model, modelOutro, storageGb, color, colorOutra, imei, imei2,
    turnsOn, fazRecebeLigacoes, wifiBluetoothOk,
    marcasDeUso, traseiraLateralDanificada, telaDanificada, biometriaFunciona, cameraComProblema,
    saudeBateria, pecaNaoGenuina, includesBox, hasInvoice, offerType, contactName, contactPhone, contactEmail,
  ]);

  // "Outro(a)" no seletor de botões revela um campo livre — resolve pro
  // valor de verdade usado no cálculo e no envio.
  const brandResolvido = brand === "Outra" ? brandOutra : brand;
  const modelResolvido = model === "Outro" ? modelOutro : model;
  const colorResolvido = color === "Outra" ? colorOutra : color;

  const respostas: RespostasEstimativa = {
    brand: brandResolvido, model: modelResolvido,
    storageGb: storageGb ? Number(storageGb) : undefined,
    turnsOn, fazRecebeLigacoes, wifiBluetoothOk, marcasDeUso,
    traseiraLateralDanificada, telaDanificada, biometriaFunciona, cameraComProblema,
    saudeBateria, pecaNaoGenuina, includesBox,
  };

  const rejeitado = useMemo(
    () => deveRejeitar({ turnsOn, fazRecebeLigacoes, wifiBluetoothOk }),
    [turnsOn, fazRecebeLigacoes, wifiBluetoothOk]
  );

  const ofertas = useMemo(
    () =>
      calcularOfertas({
        brand: brandResolvido, model: modelResolvido,
        storageGb: storageGb ? Number(storageGb) : undefined,
        turnsOn, fazRecebeLigacoes, wifiBluetoothOk, marcasDeUso,
        traseiraLateralDanificada, telaDanificada, biometriaFunciona, cameraComProblema,
        saudeBateria, pecaNaoGenuina, includesBox,
      }, catalogo),
    [
      brandResolvido, modelResolvido, storageGb, turnsOn, fazRecebeLigacoes, wifiBluetoothOk, marcasDeUso,
      traseiraLateralDanificada, telaDanificada, biometriaFunciona, cameraComProblema,
      saudeBateria, pecaNaoGenuina, includesBox, catalogo,
    ]
  );

  const aparelhoValido = brandResolvido.trim().length > 1 && modelResolvido.trim().length > 1;
  const contatoValido =
    contactName.trim().length > 2 && contactPhone.trim().length >= 8 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim());
  const imeiValido = REGEX_IMEI.test(imei);
  const imei2Valido = REGEX_IMEI.test(imei2);

  // Assim que enviada, a solicitação já nasce aceita (o cliente escolhe a
  // modalidade e vê o valor ANTES de enviar) — não existe contraproposta,
  // então qualquer solicitação registrada vai direto pra assinatura do
  // contrato e depois pro checkout, sem etapa de espera no meio.
  let effectiveStep: WizardStepId;
  if (!row) {
    effectiveStep = localStep;
  } else if (!row.contract_accepted_at) {
    effectiveStep = "termos";
  } else if (!row.documento_selfie_uploaded_at) {
    effectiveStep = "documentos";
  } else {
    effectiveStep = "checkout";
  }

  async function handleEnviarSolicitacao() {
    if (!imeiValido) {
      setErro("Informe um IMEI válido, com os 15 números.");
      return;
    }
    if (!imei2Valido) {
      setErro("Informe o IMEI 2, com os 15 números.");
      return;
    }
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
        color: colorResolvido || undefined,
        imei,
        imei2,
        hasInvoice,
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
        localStorage.removeItem(DRAFT_KEY);
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

  function selecionarFotoDocumento(file: File | null) {
    setArquivoDocumento(file);
    setErroDocumento(null);
    setPreviewDocumento((atual) => {
      if (atual) URL.revokeObjectURL(atual);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleEnviarDocumento() {
    if (!row || !arquivoDocumento) return;
    setErroDocumento(null);
    setEnviandoDocumento(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErroDocumento("Sua sessão expirou — faça login novamente.");
        return;
      }

      const extensao = arquivoDocumento.name.split(".").pop() || "jpg";
      const caminho = `${user.id}/${row.id}/documento-selfie-${Date.now()}.${extensao}`;

      const { error: erroUpload } = await supabase.storage.from("documentos-venda").upload(caminho, arquivoDocumento, {
        cacheControl: "3600",
        upsert: false,
      });

      if (erroUpload) {
        console.error("[vender/formulario] falha no upload do documento:", erroUpload.message);
        setErroDocumento("Não foi possível enviar a foto. Tente novamente.");
        return;
      }

      const resultado = await enviarDocumentoIdentidade(row.id, caminho);
      if (resultado.error) {
        setErroDocumento(resultado.error);
        return;
      }
      router.refresh();
    } catch {
      setErroDocumento("Não foi possível enviar a foto agora. Tente novamente.");
    } finally {
      setEnviandoDocumento(false);
    }
  }

  async function handleDefinirRecebimento() {
    if (!row) return;
    setErro(null);
    setSalvandoRecebimento(true);
    try {
      const resultado = await definirRecebimento(row.id, metodoRecebimento, detalhesRecebimento, metodoEnvio);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      router.refresh();
    } finally {
      setSalvandoRecebimento(false);
    }
  }

  async function handleDefinirMetodoEnvio() {
    if (!row) return;
    setErro(null);
    setSalvandoRecebimento(true);
    try {
      const resultado = await definirMetodoEnvio(row.id, metodoEnvio);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      router.refresh();
    } finally {
      setSalvandoRecebimento(false);
    }
  }

  async function handleRegistrarRastreio() {
    if (!row) return;
    setErro(null);
    setSalvandoRecebimento(true);
    try {
      const resultado = await registrarRastreioCorreios(row.id, codigoRastreio);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      setCodigoRastreio("");
      router.refresh();
    } finally {
      setSalvandoRecebimento(false);
    }
  }

  const banner = getBanner(effectiveStep, row, rejeitado);

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-12 py-8">
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
            <PerguntaOpcoes
              pergunta="Marca"
              valor={brand}
              onChange={(v) => {
                setBrand(v);
                setModel(""); // marca mudou — o modelo escolhido antes pode não existir mais na lista
              }}
              opcoes={[...MARCAS_SUGERIDAS.map((m) => ({ value: m, label: m })), { value: "Outra", label: "Outra marca" }]}
            />
            {brand === "Outra" && (
              <Campo label="Qual marca?" value={brandOutra} onChange={setBrandOutra} placeholder="Digite a marca" />
            )}

            {brandResolvido.trim().length > 0 && (
              <>
                <PerguntaOpcoes
                  pergunta="Modelo"
                  valor={model}
                  onChange={setModel}
                  opcoes={[...modelosDaMarca.map((m) => ({ value: m, label: m })), { value: "Outro", label: "Outro modelo" }]}
                />
                {model === "Outro" && (
                  <Campo label="Qual modelo?" value={modelOutro} onChange={setModelOutro} placeholder="Ex: iPhone 14 Pro" />
                )}
              </>
            )}

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

            <PerguntaOpcoes
              pergunta="Cor"
              valor={color}
              onChange={setColor}
              opcoes={[...CORES_SUGERIDAS.map((c) => ({ value: c, label: c })), { value: "Outra", label: "Outra cor" }]}
            />
            {color === "Outra" && (
              <Campo label="Qual cor?" value={colorOutra} onChange={setColorOutra} placeholder="Digite a cor" />
            )}
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
            brand={brandResolvido}
            model={modelResolvido}
            storageGb={storageGb}
            color={colorResolvido}
            valorCents={ofertas.agoraCents}
          />
        </div>
      )}

      {effectiveStep === "condicoes" && !row && (
        <div className="grid lg:grid-cols-[220px_1fr_240px] gap-5 items-start">
          <DeviceSummaryCard
            brand={brandResolvido}
            model={modelResolvido}
            storageGb={storageGb ? Number(storageGb) : null}
            color={colorResolvido}
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
                  <input type="checkbox" checked={hasInvoice} onChange={(e) => setHasInvoice(e.target.checked)} />
                  Tenho nota fiscal
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
          brand={brandResolvido}
          model={modelResolvido}
          storageGb={storageGb}
          color={colorResolvido}
          valorCents={ofertas.agoraCents}
        />
      )}

      {effectiveStep === "oferta" && (
        <div className="grid lg:grid-cols-[220px_1fr] gap-5 items-start">
          <DeviceSummaryCard
            brand={row?.brand ?? brandResolvido}
            model={row?.model ?? modelResolvido}
            storageGb={row ? row.storage_gb : storageGb ? Number(storageGb) : null}
            color={row?.color ?? colorResolvido}
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

                <h3 className="font-semibold text-foreground text-sm mb-2">IMEI do aparelho</h3>
                <div className="mb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Campo
                        label="IMEI 1"
                        value={imei}
                        onChange={(v) => setImei(v.replace(/\D/g, "").slice(0, 15))}
                        placeholder="Ex: 123456789012345"
                        inputMode="numeric"
                      />
                      {imei.length > 0 && !imeiValido && (
                        <p className="text-xs text-red-600 mt-1">O IMEI precisa ter exatamente 15 números.</p>
                      )}
                    </div>
                    <div>
                      <Campo
                        label="IMEI 2"
                        value={imei2}
                        onChange={(v) => setImei2(v.replace(/\D/g, "").slice(0, 15))}
                        placeholder="Ex: 123456789012345"
                        inputMode="numeric"
                      />
                      {imei2.length > 0 && !imei2Valido && (
                        <p className="text-xs text-red-600 mt-1">O segundo IMEI precisa ter exatamente 15 números.</p>
                      )}
                    </div>
                  </div>
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
                    disabled={enviando || !contatoValido || !imeiValido || !imei2Valido}
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
                <strong>{row.brand} {row.model}{row.storage_gb ? ` ${row.storage_gb}GB` : ""}{row.color ? `, cor ${row.color}` : ""}</strong>
                {row.imei ? <>, IMEI <strong>{row.imei}</strong>{row.imei2 ? <> / <strong>{row.imei2}</strong></> : ""}</> : ""},
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

      {effectiveStep === "documentos" && row && (
        <div className="grid lg:grid-cols-[220px_1fr] gap-5 items-start">
          <DeviceSummaryCard brand={row.brand} model={row.model} storageGb={row.storage_gb} color={row.color} />

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-bold text-foreground text-lg mb-2">Confirme sua identidade</h2>
            <p className="text-sm text-muted mb-4">
              Por segurança, e para eventual necessidade jurídica, precisamos de uma foto sua segurando um documento
              de identidade (RG, CNH ou passaporte) ao lado do rosto, com os dados legíveis. Essa foto é guardada de
              forma privada — só a equipe da Brasil Multi Tech tem acesso.
            </p>

            <div className="flex flex-col items-center gap-3 mb-4">
              {previewDocumento ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDocumento}
                  alt="Prévia da foto selecionada"
                  className="max-h-64 rounded-xl border border-border object-contain"
                />
              ) : (
                <div className="w-full h-40 rounded-xl border border-dashed border-border flex items-center justify-center text-xs text-muted">
                  Nenhuma foto selecionada
                </div>
              )}

              <label className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border hover:border-brand hover:bg-brand-light/40 transition-colors px-4 py-2.5 text-sm font-medium text-brand-dark cursor-pointer">
                {arquivoDocumento ? "Trocar foto" : "Selecionar foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => selecionarFotoDocumento(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {erroDocumento && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erroDocumento}</p>}

            <button
              disabled={!arquivoDocumento || enviandoDocumento}
              onClick={handleEnviarDocumento}
              className="w-full inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-brand-foreground font-bold text-sm transition-colors"
            >
              {enviandoDocumento ? "Enviando…" : "Enviar e continuar"}
            </button>
          </div>
        </div>
      )}

      {effectiveStep === "checkout" && row && (
        <div className="grid lg:grid-cols-[220px_1fr] gap-5 items-start">
          <DeviceSummaryCard brand={row.brand} model={row.model} storageGb={row.storage_gb} color={row.color} />

          <div className="rounded-2xl border border-border bg-surface p-6">
            {!row.payment_method ? (
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

                  <ShippingMethodTabs value={metodoEnvio} onChange={setMetodoEnvio} />

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
                  {salvandoRecebimento ? "Salvando…" : "Confirmar e ver instruções"}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-5">
                {row.status === "concluido" ? (
                  <div className="rounded-xl bg-success-light px-4 py-3">
                    <h2 className="font-bold text-success">Venda concluída</h2>
                    <p className="text-sm text-foreground">O pagamento foi marcado como enviado pela equipe.</p>
                  </div>
                ) : (
                  <div>
                    <h2 className="font-bold text-foreground text-lg">Acompanhe sua venda</h2>
                    <p className="text-sm text-muted mt-1">
                      Recebimento escolhido: <strong>{row.payment_method === "pix" ? "Pix" : "Transferência bancária"}</strong>
                    </p>
                  </div>
                )}

                {!row.shipping_method ? (
                  <>
                    <ShippingMethodTabs value={metodoEnvio} onChange={setMetodoEnvio} />
                    {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}
                    <button
                      type="button"
                      disabled={salvandoRecebimento}
                      onClick={handleDefinirMetodoEnvio}
                      className="w-full inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-brand-foreground font-bold text-sm transition-colors"
                    >
                      {salvandoRecebimento ? "Salvando…" : "Confirmar forma de envio"}
                    </button>
                  </>
                ) : (
                  <>
                    <ProcessoVendaTimeline row={row} />
                    <InstrucoesEnvio metodo={row.shipping_method} solicitacaoId={row.id} />

                    {row.shipping_method === "correios" && (
                      <div className="border-t border-border pt-4">
                        {row.shipping_tracking_code ? (
                          <p className="text-sm text-muted">
                            Rastreio informado: {" "}
                            <a
                              href={`https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(row.shipping_tracking_code)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-brand-dark underline"
                            >
                              {row.shipping_tracking_code}
                            </a>
                          </p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <label htmlFor="codigo-rastreio-venda" className="text-sm font-semibold text-foreground">
                              Código de rastreio dos Correios
                            </label>
                            <div className="flex gap-2">
                              <input
                                id="codigo-rastreio-venda"
                                value={codigoRastreio}
                                onChange={(e) => setCodigoRastreio(e.target.value.toUpperCase())}
                                placeholder="Ex.: AA123456789BR"
                                maxLength={30}
                                className="min-w-0 flex-1 h-11 rounded-lg border border-border px-3 text-sm uppercase"
                              />
                              <button
                                type="button"
                                disabled={salvandoRecebimento || codigoRastreio.trim().length < 8}
                                onClick={handleRegistrarRastreio}
                                className="rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground disabled:opacity-40"
                              >
                                {salvandoRecebimento ? "Salvando…" : "Salvar código"}
                              </button>
                            </div>
                            {erro && <p className="text-sm text-red-600">{erro}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    <a href={whatsappLink("Olá! Preciso de ajuda com o envio da minha solicitação de venda.")} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-dark hover:underline">
                      Precisa de ajuda com o envio? Fale com a loja
                    </a>
                  </>
                )}
              </div>
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
  if (step === "documentos") return { title: "Quase lá!", subtitle: "Precisamos confirmar sua identidade antes de seguir." };
  if (row?.status === "concluido") return { title: "Concluído!", subtitle: "Essa venda já foi finalizada." };
  if (row?.payment_method && !row.shipping_method) {
    return { title: "Escolha como enviar", subtitle: "Selecione Correios ou entrega na loja para acompanhar sua venda." };
  }
  if (row?.payment_method) return { title: "Acompanhe sua venda", subtitle: "Veja as instruções de envio e cada etapa do processo." };
  return { title: "Quase lá!", subtitle: "Escolha como deseja receber o pagamento." };
}

function ShippingMethodTabs({
  value,
  onChange,
}: {
  value: MetodoEnvioTradeIn;
  onChange: (metodo: MetodoEnvioTradeIn) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">Como vai entregar o aparelho?</h3>
      <div role="tablist" aria-label="Forma de envio" className="grid grid-cols-2 border-b border-border">
        {([
          { value: "correios", label: "Correios" },
          { value: "loja", label: "Entrega na loja" },
        ] as const).map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={value === option.value}
            onClick={() => onChange(option.value)}
            className={`h-10 border-b-2 text-sm font-semibold transition-colors ${
              value === option.value ? "border-brand text-brand-dark" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <InstrucoesEnvio metodo={value} />
    </section>
  );
}

function InstrucoesEnvio({ metodo, solicitacaoId }: { metodo: MetodoEnvioTradeIn; solicitacaoId?: string }) {
  const codigo = solicitacaoId?.slice(0, 8).toUpperCase();

  return (
    <div role="tabpanel" className="rounded-lg bg-[#f7f8fa] p-4 text-sm">
      {metodo === "correios" ? (
        <>
          <p className="font-semibold text-foreground">Envio pelos Correios</p>
          <ol className="mt-2 list-decimal pl-5 text-muted space-y-1">
            <li>Embale o aparelho com proteção e inclua o código {codigo ? <strong>#{codigo}</strong> : "da solicitação"} dentro do pacote.</li>
            <li>Use uma modalidade com rastreamento e guarde o comprovante.</li>
            <li>Após postar, informe o código de rastreio abaixo para acompanhar o trajeto.</li>
          </ol>
          <p className="mt-3 font-medium text-foreground">Endereço para postagem</p>
        </>
      ) : (
        <>
          <p className="font-semibold text-foreground">Entrega na loja física</p>
          <p className="mt-2 text-muted">
            Leve o aparelho à loja e informe o código {codigo ? <strong>#{codigo}</strong> : "da solicitação"} à equipe.
            Consulte o atendimento para confirmar o horário antes de ir.
          </p>
          <p className="mt-3 font-medium text-foreground">Endereço da loja</p>
        </>
      )}
      <p className="mt-1 text-muted">
        {SITE.address.line1}<br />
        {SITE.address.line2}<br />
        CEP {SITE.address.zip}
      </p>
      <a
        href={whatsappLink("Olá! Preciso confirmar as instruções para entregar meu aparelho.")}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex font-semibold text-brand-dark hover:underline"
      >
        Confirmar detalhes com a loja
      </a>
    </div>
  );
}

function ProcessoVendaTimeline({ row }: { row: TradeInRequestRow }) {
  const ordemEtapa: Record<string, number> = {
    awaiting_shipment: 0,
    in_transit: 1,
    received: 2,
    analyzing: 3,
    payment_sent: 4,
  };
  const atual = row.status === "concluido" ? 4 : (ordemEtapa[row.process_stage ?? ""] ?? -1);
  const etapas = [
    { label: "Solicitação aceita", done: true },
    { label: "Contrato assinado", done: !!row.contract_accepted_at },
    { label: "Documento enviado", done: !!row.documento_selfie_uploaded_at },
    { label: "Forma de envio escolhida", done: !!row.shipping_method },
    ...(row.shipping_method === "correios" ? [{ label: "Postado nos Correios", done: atual >= 1 }] : []),
    { label: row.shipping_method === "loja" ? "Entregue na loja" : "Aparelho recebido pela equipe", done: atual >= 2 },
    { label: "Em análise", done: atual >= 3 },
    { label: "Pagamento enviado", done: atual >= 4 },
  ];
  const etapaAtual = row.shipping_method === "loja" && atual === 0
    ? "Aguardando entrega na loja"
    : ["Aguardando envio", "Em trânsito", "Aparelho recebido", "Em análise", "Pagamento enviado"][Math.max(0, atual)];

  return (
    <section className="border-t border-border pt-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Acompanhamento da venda</h3>
        <span className="text-xs font-semibold text-brand-dark">{etapaAtual}</span>
      </div>
      <div className="flex flex-col">
        {etapas.map((etapa, indice) => (
          <div key={etapa.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${etapa.done ? "bg-brand text-brand-foreground" : "bg-[#eef0f3] text-muted"}`}>
                {etapa.done ? "✓" : indice + 1}
              </span>
              {indice < etapas.length - 1 && <span className={`min-h-5 w-px flex-1 ${etapa.done ? "bg-brand" : "bg-border"}`} />}
            </div>
            <span className={`pb-3 text-sm ${etapa.done ? "font-medium text-foreground" : "text-muted"}`}>{etapa.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
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
