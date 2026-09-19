"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { adicionarBannerPrincipal, criarUrlUploadBanner, type EstadoBanner } from "./actions";

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

  useEffect(() => {
    if (eraPending.current && !pending && !estado?.erro) {
      limparFormulario();
    }
    eraPending.current = pending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function limparFormulario() {
    setDesktop(null);
    setMobile(null);
    setErroUpload(null);
    setChaveInputs((k) => k + 1);
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
          onArquivo={(f) => enviarArquivo(f, "desktop")}
        />
        <CampoImagem
          key={`mobile-${chaveInputs}`}
          rotulo="Imagem para celular (opcional)"
          ajuda="Se não enviar, o celular mostra a mesma imagem do desktop, cortada para caber na tela."
          imagem={mobile}
          carregando={enviando === "mobile"}
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

      <button
        type="submit"
        disabled={!desktop || pending || enviando !== null}
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
  onArquivo,
}: {
  rotulo: string;
  ajuda: string;
  imagem: ImagemEnviada;
  carregando: boolean;
  onArquivo: (arquivo: File) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{rotulo}</span>
      <span className="text-xs text-muted">{ajuda}</span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
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
