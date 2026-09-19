"use client";

import { useState } from "react";
import { resolvePhotoSrc } from "@/lib/data/products";
import { CONDITION_LABELS } from "@/lib/conditions";
import { ProductCondition } from "@/lib/types";

export type FotoVariante = {
  variantId: string;
  condition: ProductCondition;
  color: string | null;
  storageGb: number | null;
  sku: string | null;
  photos: string[];
};

/** Rótulo curto pra identificar a qual variação (cor/capacidade/condição/código) cada foto pertence. */
function rotuloVariante(v: FotoVariante) {
  const partes = [v.color, v.storageGb ? `${v.storageGb}GB` : null, CONDITION_LABELS[v.condition]].filter(Boolean);
  const rotulo = partes.join(" · ") || "Variação";
  return v.sku ? `${rotulo} (cód. ${v.sku})` : rotulo;
}

export function ProdutoFotosCell({ produtoNome, variantes }: { produtoNome: string; variantes: FotoVariante[] }) {
  const [ampliada, setAmpliada] = useState<{ src: string; legenda: string } | null>(null);

  const todasFotos = variantes.flatMap((v) => v.photos.map((foto) => ({ src: resolvePhotoSrc(foto), legenda: rotuloVariante(v) })));
  const primeiraFoto = todasFotos[0];

  return (
    <>
      <button
        type="button"
        onClick={() => primeiraFoto && setAmpliada(primeiraFoto)}
        disabled={todasFotos.length === 0}
        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f0f1f4] flex items-center justify-center text-[10px] text-muted disabled:cursor-default"
        title={todasFotos.length > 0 ? "Ver fotos cadastradas" : "Nenhuma foto cadastrada"}
      >
        {primeiraFoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={primeiraFoto.src} alt="" className="h-full w-full object-cover" />
        ) : (
          "sem foto"
        )}
        {todasFotos.length > 1 && (
          <span className="absolute bottom-0 right-0 rounded-tl-md bg-black/70 px-1 text-[9px] font-semibold text-white">
            +{todasFotos.length - 1}
          </span>
        )}
      </button>

      {ampliada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${produtoNome}`}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/80 p-6"
          onClick={() => setAmpliada(null)}
        >
          <button
            type="button"
            onClick={() => setAmpliada(null)}
            aria-label="Fechar"
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            ✕
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ampliada.src}
            alt={`${produtoNome} — ${ampliada.legenda}`}
            className="max-h-[75vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="text-sm font-medium text-white">{ampliada.legenda}</p>

          {todasFotos.length > 1 && (
            <div
              className="flex max-w-full flex-wrap justify-center gap-2 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {todasFotos.map((foto, i) => (
                <button
                  key={`${foto.src}-${i}`}
                  type="button"
                  onClick={() => setAmpliada(foto)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    foto.src === ampliada.src ? "border-white" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foto.src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
