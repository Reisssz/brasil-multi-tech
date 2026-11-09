"use client";

import { useActionState, useState } from "react";
import { atualizarBarraTopo, criarUrlUploadBarraTopo } from "./actions";
import { createClient } from "@/lib/supabase/client";
import type { ConfiguracaoBarraTopo } from "@/lib/promo-bar";

const CLASSE_INPUT = "h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand";

type ImagemBarra = { url: string; width: number; height: number };

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
      reject(new Error("imagem ilegivel"));
    };
    img.src = url;
  });
}

export function FormularioBarraTopo({ config }: { config: ConfiguracaoBarraTopo }) {
  const [estado, formAction, pending] = useActionState(atualizarBarraTopo, null);
  const [imagem, setImagem] = useState<ImagemBarra | null>(
    config.imagemUrl && config.imagemLargura && config.imagemAltura
      ? { url: config.imagemUrl, width: config.imagemLargura, height: config.imagemAltura }
      : null
  );
  const [enviando, setEnviando] = useState(false);
  const [erroUpload, setErroUpload] = useState<string | null>(null);

  async function enviarImagem(arquivo: File | undefined) {
    if (!arquivo) return;
    setErroUpload(null);
    setEnviando(true);
    try {
      const { width, height } = await medirImagem(arquivo);
      const { path, token, erro } = await criarUrlUploadBarraTopo(arquivo.name);
      if (erro || !path || !token) {
        setErroUpload(erro ?? "Não foi possível preparar o upload.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.storage.from("banners").uploadToSignedUrl(path, token, arquivo);
      if (error) {
        console.error("[admin/barra-topo] falha no upload:", error.message);
        setErroUpload("Não foi possível enviar a imagem. Tente novamente.");
        return;
      }

      setImagem({ url: supabase.storage.from("banners").getPublicUrl(path).data.publicUrl, width, height });
    } catch {
      setErroUpload("Não foi possível ler essa imagem. Tente outro arquivo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <label className="flex items-center gap-3 text-sm font-medium text-foreground">
        <input type="checkbox" name="ativo" defaultChecked={config.ativo} className="h-4 w-4 accent-[color:var(--brand)]" />
        Exibir a barra no topo do site
      </label>

      <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
        <p className="text-sm font-medium text-foreground">Arte de campanha (opcional)</p>
        <p className="text-xs text-muted">
          Envie uma imagem larga e baixa (ex: 1920×48) como a da Black Friday. Quando houver imagem, ela substitui os
          textos abaixo e a barra inteira vira link para o endereço informado em “Link da barra”.
        </p>

        {imagem && (
          <div className="overflow-hidden rounded-lg border border-border bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagem.url} alt="Prévia da barra do topo" className="w-full h-auto" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-dashed border-border px-3 text-xs font-medium text-brand-dark hover:border-brand">
            {enviando ? "Enviando…" : imagem ? "Trocar imagem" : "Enviar imagem"}
            <input
              type="file"
              accept="image/*"
              disabled={enviando}
              className="sr-only"
              onChange={(e) => {
                enviarImagem(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {imagem && (
            <button type="button" onClick={() => setImagem(null)} className="text-xs font-medium text-red-600 hover:underline">
              Remover imagem
            </button>
          )}
        </div>

        {erroUpload && <p className="text-xs text-red-600">{erroUpload}</p>}
        <input type="hidden" name="imagemUrl" value={imagem?.url ?? ""} />
        <input type="hidden" name="imagemLargura" value={imagem?.width ?? ""} />
        <input type="hidden" name="imagemAltura" value={imagem?.height ?? ""} />
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Mensagens que se alternam (uma por linha)
        <textarea
          name="mensagens"
          rows={6}
          defaultValue={config.mensagens.join("\n")}
          className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand resize-y"
        />
        <span className="text-xs font-normal text-muted">
          Use {"{parcelas}"} para inserir automaticamente o máximo de parcelas sem juros. Até 10 mensagens de 120
          caracteres.
        </span>
      </label>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Texto fixo à esquerda
          <input name="rotulo" defaultValue={config.rotulo} maxLength={40} placeholder="Opcional" className={CLASSE_INPUT} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Texto do botão
          <input name="ctaTexto" defaultValue={config.ctaTexto} maxLength={30} placeholder="Opcional" className={CLASSE_INPUT} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Link da barra
          <input name="ctaHref" defaultValue={config.ctaHref} placeholder="/categoria/ofertas" className={CLASSE_INPUT} />
        </label>
      </div>

      {estado?.erro && <p className="text-sm text-red-600">{estado.erro}</p>}
      {estado?.sucesso && <p className="text-sm text-success">Barra do topo salva.</p>}

      <button
        type="submit"
        disabled={pending || enviando}
        className="w-fit inline-flex h-11 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-brand-foreground font-semibold px-6 text-sm transition-colors"
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
