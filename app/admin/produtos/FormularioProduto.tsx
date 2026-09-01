"use client";

import { useActionState, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EstadoProduto } from "./actions";

type Categoria = { id: string; nome: string };

type Variante = {
  color: string;
  colorHex: string;
  storageGb: string;
  condition: string;
  price: string;
  stock: string;
  sku: string;
  photos: string[];
};

type ProdutoExistente = {
  id: string;
  name: string;
  brand: string;
  categoryId: string | null;
  tagline: string;
  description: string;
  highlights: string[];
  warrantyMonths: number;
  freeShipping: boolean;
  ativo: boolean;
  variantes: Variante[];
};

const CONDICOES = [
  { value: "novo", label: "Novo" },
  { value: "excelente", label: "Excelente" },
  { value: "muito-bom", label: "Muito Bom" },
  { value: "bom", label: "Bom" },
  { value: "outlet", label: "Outlet" },
];

function varianteVazia(): Variante {
  return {
    color: "",
    colorHex: "#9aa0a6",
    storageGb: "",
    condition: "novo",
    price: "",
    stock: "0",
    sku: "",
    photos: [],
  };
}

function resolverFotoSrc(url: string) {
  return /^https?:\/\//.test(url) ? url : `/products/${url}`;
}

export default function FormularioProduto({
  categorias,
  action,
  produto,
}: {
  categorias: Categoria[];
  action: (estado: EstadoProduto, formData: FormData) => Promise<EstadoProduto>;
  produto?: ProdutoExistente;
}) {
  const [estado, formAction, pending] = useActionState(action, null);
  const [variantes, setVariantes] = useState<Variante[]>(produto?.variantes ?? [varianteVazia()]);

  // Pasta própria pro upload direto do navegador — as fotos vão pro Storage
  // ANTES do submit do formulário, então não dependem do slug do produto
  // (que só existe depois de criado).
  const [pastaUpload] = useState(() => crypto.randomUUID());
  const [enviandoPorVariante, setEnviandoPorVariante] = useState<Record<number, number>>({});
  const [erroUploadPorVariante, setErroUploadPorVariante] = useState<Record<number, string | null>>({});
  const inputsRef = useRef<Record<number, HTMLInputElement | null>>({});

  /**
   * Envia as fotos direto do navegador pro Supabase Storage (em vez de
   * mandar os arquivos pela Server Action). O upload de arquivo binário
   * através da Server Action quebra em produção com
   * "Cannot set property socket of #<ComputeJsIncomingMessage>..." — uma
   * incompatibilidade do runtime de hospedagem com corpos multipart
   * grandes. Fazendo o upload aqui, a Server Action só recebe texto.
   */
  async function selecionarArquivos(indice: number, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const arquivos = Array.from(fileList);

    setErroUploadPorVariante((atual) => ({ ...atual, [indice]: null }));
    setEnviandoPorVariante((atual) => ({ ...atual, [indice]: (atual[indice] ?? 0) + arquivos.length }));

    const supabase = createClient();
    let houveErro = false;

    for (const arquivo of arquivos) {
      const extensao = arquivo.name.split(".").pop();
      const caminho = `${pastaUpload}/variante-${indice}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${extensao}`;

      const { error } = await supabase.storage.from("produtos").upload(caminho, arquivo, {
        cacheControl: "31536000",
        upsert: false,
      });

      if (error) {
        console.error("[admin/produtos] falha no upload de imagem:", error.message);
        houveErro = true;
      } else {
        const { data } = supabase.storage.from("produtos").getPublicUrl(caminho);
        setVariantes((v) =>
          v.map((item, i) => (i === indice ? { ...item, photos: [...item.photos, data.publicUrl] } : item))
        );
      }

      setEnviandoPorVariante((atual) => ({ ...atual, [indice]: Math.max(0, (atual[indice] ?? 1) - 1) }));
    }

    if (houveErro) {
      setErroUploadPorVariante((atual) => ({
        ...atual,
        [indice]: "Não foi possível enviar uma ou mais fotos. Tente novamente.",
      }));
    }

    const input = inputsRef.current[indice];
    if (input) input.value = "";
  }

  function atualizarVariante(indice: number, campo: keyof Variante, valor: string) {
    setVariantes((v) => v.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)));
  }

  function removerFotoDaVariante(indice: number, url: string) {
    setVariantes((v) =>
      v.map((item, i) => (i === indice ? { ...item, photos: item.photos.filter((p) => p !== url) } : item))
    );
  }

  function adicionarVariante() {
    setVariantes((v) => [...v, varianteVazia()]);
  }

  function removerVariante(indice: number) {
    setVariantes((v) => v.filter((_, i) => i !== indice));
  }

  const enviandoFotos = Object.values(enviandoPorVariante).some((n) => n > 0);

  return (
    <form action={formAction} className="flex flex-col gap-6 pb-24">
      <Secao titulo="Informações básicas">
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo label="Nome do produto" name="name" defaultValue={produto?.name} placeholder="Ex: iPhone 13" required />
          <Campo label="Marca" name="brand" defaultValue={produto?.brand} placeholder="Ex: Apple" required />
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Categoria
          <select
            name="categoryId"
            defaultValue={produto?.categoryId ?? ""}
            required
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand bg-white"
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        <Campo
          label="Frase curta (aparece embaixo do nome na loja)"
          name="tagline"
          defaultValue={produto?.tagline}
          placeholder="Ex: Seminovo revisado, tela OLED e 5G"
        />
      </Secao>

      <Secao titulo="Descrição">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Descrição completa
          <textarea
            name="description"
            defaultValue={produto?.description}
            rows={4}
            placeholder="Conte os detalhes do produto para o cliente..."
            className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand resize-y"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Destaques
          <textarea
            name="highlights"
            defaultValue={produto?.highlights?.join("\n")}
            rows={3}
            placeholder={"Um por linha, por exemplo:\nBateria com no mínimo 85%\nTela testada em laudo de 40 pontos"}
            className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand resize-y"
          />
          <span className="text-xs text-muted font-normal">
            Aparecem como uma lista com ✓ na página do produto. Um item por linha.
          </span>
        </label>
      </Secao>

      <Secao titulo="Variações">
        <p className="text-xs text-muted -mt-2">
          Cada variação (cor) tem suas próprias fotos — útil quando o Preto e o Branco, por exemplo, precisam de fotos diferentes.
        </p>

        <div className="flex flex-col gap-4">
          {variantes.map((v, indice) => (
            <div key={indice} className="rounded-xl border border-border p-4 relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Variação {indice + 1}</span>
                {variantes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerVariante(indice)}
                    className="text-xs font-medium text-red-500 hover:text-red-600"
                  >
                    Remover variação
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <CampoVariante label="Cor">
                  <input
                    name="varianteCor"
                    placeholder="Ex: Preto"
                    value={v.color}
                    onChange={(e) => atualizarVariante(indice, "color", e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-2.5 text-sm outline-none focus:border-brand"
                  />
                </CampoVariante>

                <CampoVariante label="Cor (visual)">
                  <input
                    name="varianteCorHex"
                    type="color"
                    value={v.colorHex}
                    onChange={(e) => atualizarVariante(indice, "colorHex", e.target.value)}
                    className="h-10 w-full rounded-lg border border-border cursor-pointer"
                  />
                </CampoVariante>

                <CampoVariante label="Armazenamento (GB)">
                  <input
                    name="varianteStorage"
                    type="number"
                    placeholder="Ex: 128"
                    value={v.storageGb}
                    onChange={(e) => atualizarVariante(indice, "storageGb", e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-2.5 text-sm outline-none focus:border-brand"
                  />
                </CampoVariante>

                <CampoVariante label="Condição">
                  <select
                    name="varianteCondicao"
                    value={v.condition}
                    onChange={(e) => atualizarVariante(indice, "condition", e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-2.5 text-sm outline-none focus:border-brand bg-white"
                  >
                    {CONDICOES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </CampoVariante>

                <CampoVariante label="Preço (R$)">
                  <input
                    name="variantePreco"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                    value={v.price}
                    onChange={(e) => atualizarVariante(indice, "price", e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-2.5 text-sm outline-none focus:border-brand"
                  />
                </CampoVariante>

                <CampoVariante label="Estoque">
                  <input
                    name="varianteEstoque"
                    type="number"
                    placeholder="0"
                    value={v.stock}
                    onChange={(e) => atualizarVariante(indice, "stock", e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-2.5 text-sm outline-none focus:border-brand"
                  />
                </CampoVariante>

                <CampoVariante label="SKU (opcional)">
                  <input
                    name="varianteSku"
                    placeholder="Gerado automaticamente"
                    value={v.sku}
                    onChange={(e) => atualizarVariante(indice, "sku", e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-2.5 text-sm outline-none focus:border-brand"
                  />
                </CampoVariante>
              </div>

              <div className="border-t border-border pt-3 flex flex-col gap-2.5">
                <p className="text-xs font-medium text-foreground">
                  Fotos desta variação {v.photos.length > 0 && `(${v.photos.length})`}
                </p>

                {v.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2.5">
                    {v.photos.map((url, i) => (
                      <div key={url} className="group relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolverFotoSrc(url)}
                          alt=""
                          className="h-16 w-16 rounded-lg border border-border object-cover"
                        />
                        <span className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/50 text-[9px] font-semibold text-white">
                          {i + 1}
                        </span>
                        <input type="hidden" name={`varianteFotosExistentes_${indice}`} value={url} />
                        <button
                          type="button"
                          onClick={() => removerFotoDaVariante(indice, url)}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remover foto"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-2 rounded-lg border border-dashed border-border hover:border-brand hover:bg-brand-light/40 transition-colors px-3 py-2 text-xs font-medium text-brand-dark cursor-pointer w-fit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Adicionar fotos (pode selecionar várias)
                  <input
                    ref={(el) => {
                      inputsRef.current[indice] = el;
                    }}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => selecionarArquivos(indice, e.target.files)}
                  />
                </label>

                {(enviandoPorVariante[indice] ?? 0) > 0 && (
                  <p className="text-xs text-brand-dark flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                    Enviando {enviandoPorVariante[indice]} foto{enviandoPorVariante[indice] > 1 ? "s" : ""}…
                  </p>
                )}

                {erroUploadPorVariante[indice] && (
                  <p className="text-xs text-red-600">{erroUploadPorVariante[indice]}</p>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={adicionarVariante}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border hover:border-brand hover:text-brand-dark py-2.5 text-sm font-semibold text-muted transition-colors"
          >
            + Adicionar outra variação
          </button>
        </div>
      </Secao>

      <Secao titulo="Configurações">
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo
            label="Garantia (meses)"
            name="warrantyMonths"
            type="number"
            defaultValue={produto?.warrantyMonths ?? 12}
          />

          <div className="flex flex-col gap-2 justify-end pb-0.5">
            <ToggleField label="Frete grátis" name="freeShipping" defaultChecked={produto?.freeShipping ?? true} />
            {produto && <ToggleField label="Produto ativo (visível na loja)" name="ativo" defaultChecked={produto.ativo} />}
          </div>
        </div>
      </Secao>

      {estado?.erro && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{estado.erro}</p>
      )}

      <div className="fixed bottom-0 inset-x-0 sm:relative sm:inset-auto bg-surface sm:bg-transparent border-t sm:border-0 border-border p-4 sm:p-0 z-20">
        <button
          type="submit"
          disabled={pending || enviandoFotos}
          className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-brand-foreground font-bold text-sm px-8 transition-colors"
        >
          {pending ? "Salvando…" : enviandoFotos ? "Enviando fotos…" : produto ? "Salvar alterações" : "Cadastrar produto"}
        </button>
      </div>
    </form>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 flex flex-col gap-4">
      <h2 className="font-display text-base font-bold text-foreground">{titulo}</h2>
      {children}
    </div>
  );
}

function CampoVariante({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted">
      {label}
      {children}
    </label>
  );
}

function ToggleField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5 cursor-pointer">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-[#e2e4e9] peer-checked:bg-brand transition-colors after:absolute after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
    </label>
  );
}

function Campo({
  label,
  name,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      <input
        name={name}
        {...props}
        className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}