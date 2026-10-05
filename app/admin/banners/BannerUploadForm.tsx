"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { adicionarBannerPrincipal, atualizarImagemMobileBanner, criarUrlUploadBanner, type EstadoBanner } from "./actions";

type ImagemEnviada = { url: string; width: number; height: number } | null;

/** Lê a largura/altura reais do arquivo no navegador antes do upload, pra não depender do Storage/sharp pra isso. */
function medirImagem(arquivo: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler as dimensões da imagem."));
    };
    img.src = url;
  });
}

export function BannerUploadForm() {
  const [estado, formAction, pending] = useActionState<EstadoBanner, FormData>(adicionarBannerPrincipal, null);
  const [desktop, setDesktop] = useState<ImagemEnviada>(null);
  const [mobile, setMobile] = useState<ImagemEnviada>(null);
  const [enviando, setEnviando] = useState<"desktop" | "mobile" | null>(null);
  const [erroUpload, setErroUpload] = useState<string | null>(null);
  const [chaveInputs, setChaveInputs] = useState(0);
  const eraPending = useRef(false);

  function limparFormulario() {
    setDesktop(null);
    setMobile(null);
    setErroUpload(null);
    setChaveInputs((k) => k + 1);
  }

  useEffect(() => {
    if (eraPending.current && !pending && !estado?.erro) {
      limparFormulario();
    }
    eraPending.current = pending;
  }, [pending, estado]);

  async function enviarArquivo(arquivo: File, tipo: "desktop" | "mobile") {
    setErroUpload(null);
    setEnviando(tipo);
    try {
      const { width, height } = await medirImagem(arquivo);

      // URL de upload assinada gerada no servidor (client admin) — o
      // arquivo em si vai direto do navegador pro Storage, sem passar pela
      // Server Action, e sem depender de policy de RLS pro usuário logado.
      const { path, token, erro } = await criarUrlUploadBanner(arquivo.name);
      if (erro || !path || !token) {
        setErroUpload(erro ?? "Não foi possível preparar o upload.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.storage.from("banners").uploadToSignedUrl(path, token, arquivo);

      if (error) {
        console.error("[admin/banners] falha no upload:", error.message);
        setErroUpload("Não foi possível enviar a imagem. Tente novamente.");
        return;
      }

      const { data } = supabase.storage.from("banners").getPublicUrl(path);
      const resultado = { url: data.publicUrl, width, height };
      if (tipo === "desktop") setDesktop(resultado);
      else setMobile(resultado);
    } catch {
      setErroUpload("Não foi possível ler essa imagem. Tente outro arquivo.");
    } finally {
      setEnviando(null);
    }
  }

  return (
    <form action={formAction} className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4">
      <h2 className="font-semibold text-foreground">Adicionar banner</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <CampoImagem
          key={`desktop-${chaveInputs}`}
          rotulo="Imagem principal (desktop) *"
          ajuda="Aparece no topo do site em telas de computador. Use uma imagem larga (ex: 1920×640)."
          imagem={desktop}
          carregando={enviando === "desktop"}
          desabilitado={enviando !== null || pending}
          onArquivo={(f) => enviarArquivo(f, "desktop")}
        />
        <CampoImagem
          key={`mobile-${chaveInputs}`}
          rotulo="Imagem para celular *"
          ajuda="Obrigatória. Essa imagem será exibida no celular; a versão desktop não aparece em telas mobile."
          imagem={mobile}
          carregando={enviando === "mobile"}
          desabilitado={enviando !== null || pending}
          onArquivo={(f) => enviarArquivo(f, "mobile")}
        />
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Link ao clicar (opcional)</span>
        <input
          name="href"
          type="text"
          placeholder="/vender ou /categoria/celulares"
          className="h-10 rounded-lg border border-border px-3 text-sm"
        />
      </label>

      <input type="hidden" name="imagemDesktopUrl" value={desktop?.url ?? ""} />
      <input type="hidden" name="imagemDesktopLargura" value={desktop?.width ?? ""} />
      <input type="hidden" name="imagemDesktopAltura" value={desktop?.height ?? ""} />
      <input type="hidden" name="imagemMobileUrl" value={mobile?.url ?? ""} />
      <input type="hidden" name="imagemMobileLargura" value={mobile?.width ?? ""} />
      <input type="hidden" name="imagemMobileAltura" value={mobile?.height ?? ""} />

      {erroUpload && <p className="text-sm text-red-600">{erroUpload}</p>}
      {estado?.erro && <p className="text-sm text-red-600">{estado.erro}</p>}
      {(!desktop || !mobile) && (
        <p className="text-xs text-muted">Envie as imagens desktop e mobile para habilitar a inclusão do banner.</p>
      )}

      <button
        type="submit"
        disabled={!desktop || !mobile || pending || enviando !== null}
        className="self-start inline-flex h-10 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed px-5 text-sm font-semibold text-brand-foreground transition-colors"
      >
        {pending ? "Salvando…" : "+ Adicionar banner"}
      </button>
    </form>
  );
}

function CampoImagem({
  rotulo,
  ajuda,
  imagem,
  carregando,
  desabilitado,
  onArquivo,
}: {
  rotulo: string;
  ajuda: string;
  imagem: ImagemEnviada;
  carregando: boolean;
  desabilitado: boolean;
  onArquivo: (arquivo: File) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{rotulo}</span>
      <span className="text-xs text-muted">{ajuda}</span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        disabled={desabilitado}
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          if (arquivo) onArquivo(arquivo);
        }}
        className="text-xs"
      />
      {carregando && <span className="text-xs text-muted">Enviando…</span>}
      {imagem && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagem.url} alt="" className="mt-1 h-20 w-full rounded-lg object-cover border border-border" />
      )}
    </label>
  );
}

export function BannerMobileEditor({ bannerId, imagemAtual }: { bannerId: string; imagemAtual: string | null }) {
  const router = useRouter();
  const [preview, setPreview] = useState(imagemAtual);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function enviarArquivo(arquivo: File) {
    setEnviando(true);
    setErro(null);
    setSucesso(false);
    try {
      const { width, height } = await medirImagem(arquivo);
      const assinatura = await criarUrlUploadBanner(arquivo.name);
      if (assinatura.erro || !assinatura.path || !assinatura.token) {
        setErro(assinatura.erro ?? "Não foi possível preparar o upload.");
        return;
      }

      const supabase = createClient();
      const { error: erroUpload } = await supabase.storage.from("banners").uploadToSignedUrl(assinatura.path, assinatura.token, arquivo);
      if (erroUpload) {
        console.error("[admin/banners] falha no upload mobile:", erroUpload.message);
        setErro("Não foi possível enviar a imagem mobile. Tente novamente.");
        return;
      }

      const resultado = await atualizarImagemMobileBanner(bannerId, assinatura.path, width, height);
      if (resultado.erro || !resultado.url) {
        setErro(resultado.erro ?? "Não foi possível salvar a imagem mobile.");
        return;
      }

      setPreview(resultado.url);
      setSucesso(true);
      router.refresh();
    } catch {
      setErro("Não foi possível ler ou enviar essa imagem. Tente outro arquivo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Prévia mobile" className="h-14 w-14 shrink-0 rounded-lg object-cover bg-[#f0f1f4]" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#f0f1f4] text-xs text-muted">sem mobile</span>
        )}
        <div className="min-w-0">
          <label htmlFor={`banner-mobile-${bannerId}`} className="block text-sm font-semibold text-foreground">
            {preview ? "Substituir imagem mobile" : "Anexar imagem mobile"}
          </label>
          <p className="text-xs text-muted">A versão desktop não será exibida em celular.</p>
        </div>
      </div>
      <input
        id={`banner-mobile-${bannerId}`}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        disabled={enviando}
        onChange={(event) => {
          const arquivo = event.target.files?.[0];
          if (arquivo) void enviarArquivo(arquivo);
          event.target.value = "";
        }}
        className="max-w-full text-xs disabled:opacity-50"
      />
      {enviando && <span className="text-xs text-muted">Enviando e salvando…</span>}
      {sucesso && <span className="text-xs font-semibold text-success">Versão mobile salva.</span>}
      {erro && <p className="w-full text-xs text-red-600">{erro}</p>}
    </div>
  );
}
