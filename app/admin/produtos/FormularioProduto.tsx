"use client";

import { useActionState, useState } from "react";
import type { EstadoProduto } from "./actions";

type Categoria = { id: string; nome: string };

type Variante = {
  color: string;
  colorHex: string;
  storageGb: string;
  condition: string;
  price: string;
  compareAt: string;
  stock: string;
  sku: string;
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
  fotoAtual: string | null;
};

const CONDICOES = [
  { value: "novo", label: "Novo" },
  { value: "excelente", label: "Excelente" },
  { value: "muito-bom", label: "Muito Bom" },
  { value: "bom", label: "Bom" },
  { value: "outlet", label: "Outlet" },
];

function varianteVazia(): Variante {
  return { color: "", colorHex: "#9aa0a6", storageGb: "", condition: "novo", price: "", compareAt: "", stock: "0", sku: "" };
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

  function atualizarVariante(indice: number, campo: keyof Variante, valor: string) {
    setVariantes((v) => v.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)));
  }

  function adicionarVariante() {
    setVariantes((v) => [...v, varianteVazia()]);
  }

  function removerVariante(indice: number) {
    setVariantes((v) => v.filter((_, i) => i !== indice));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Campo label="Nome do produto" name="name" defaultValue={produto?.name} required />
      <Campo label="Marca" name="brand" defaultValue={produto?.brand} required />

      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        Categoria
        <select
          name="categoryId"
          defaultValue={produto?.categoryId ?? ""}
          required
          className="h-11 rounded-lg border border-border px-3 text-sm"
        >
          <option value="" disabled>
            Selecione
          </option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </label>

      <Campo label="Frase curta (tagline)" name="tagline" defaultValue={produto?.tagline} />

      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        Descrição completa
        <textarea
          name="description"
          defaultValue={produto?.description}
          rows={4}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        Destaques (um por linha)
        <textarea
          name="highlights"
          defaultValue={produto?.highlights?.join("\n")}
          rows={3}
          placeholder={"Bateria com no mínimo 85%\nTela testada em laudo de 40 pontos"}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Garantia (meses)" name="warrantyMonths" type="number" defaultValue={produto?.warrantyMonths ?? 12} />
        <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-foreground">
          <input type="checkbox" name="freeShipping" defaultChecked={produto?.freeShipping ?? true} />
          Frete grátis
        </label>
      </div>

      {produto?.fotoAtual && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Foto atual</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={produto.fotoAtual}
            alt=""
            className="h-24 w-24 rounded-lg border border-border object-cover"
          />
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        {produto ? "Substituir fotos (aplica na 1ª variação)" : "Fotos do produto (aplicam na 1ª variação)"}
        <input type="file" name="imagens" accept="image/*" multiple className="text-sm" />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Variações (cor / armazenamento / condição)</p>
          <button type="button" onClick={adicionarVariante} className="text-xs font-semibold text-brand-dark">
            + adicionar variação
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {variantes.map((v, indice) => (
            <div key={indice} className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg border border-border p-3">
              <input
                name="varianteCor"
                placeholder="Cor (ex: Preto)"
                value={v.color}
                onChange={(e) => atualizarVariante(indice, "color", e.target.value)}
                className="rounded-lg border border-border px-2 py-1.5 text-xs"
              />
              <input
                name="varianteCorHex"
                type="color"
                value={v.colorHex}
                onChange={(e) => atualizarVariante(indice, "colorHex", e.target.value)}
                className="h-9 rounded-lg border border-border"
              />
              <input
                name="varianteStorage"
                type="number"
                placeholder="Armazenamento (GB)"
                value={v.storageGb}
                onChange={(e) => atualizarVariante(indice, "storageGb", e.target.value)}
                className="rounded-lg border border-border px-2 py-1.5 text-xs"
              />
              <select
                name="varianteCondicao"
                value={v.condition}
                onChange={(e) => atualizarVariante(indice, "condition", e.target.value)}
                className="rounded-lg border border-border px-2 py-1.5 text-xs"
              >
                {CONDICOES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                name="variantePreco"
                type="number"
                step="0.01"
                placeholder="Preço (R$)"
                required
                value={v.price}
                onChange={(e) => atualizarVariante(indice, "price", e.target.value)}
                className="rounded-lg border border-border px-2 py-1.5 text-xs"
              />
              <input
                name="varianteCompareAt"
                type="number"
                step="0.01"
                placeholder="Preço riscado (opcional)"
                value={v.compareAt}
                onChange={(e) => atualizarVariante(indice, "compareAt", e.target.value)}
                className="rounded-lg border border-border px-2 py-1.5 text-xs"
              />
              <input
                name="varianteEstoque"
                type="number"
                placeholder="Estoque"
                value={v.stock}
                onChange={(e) => atualizarVariante(indice, "stock", e.target.value)}
                className="rounded-lg border border-border px-2 py-1.5 text-xs"
              />
              <div className="flex items-center gap-2">
                <input
                  name="varianteSku"
                  placeholder="SKU (opcional)"
                  value={v.sku}
                  onChange={(e) => atualizarVariante(indice, "sku", e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1.5 text-xs"
                />
                {variantes.length > 1 && (
                  <button type="button" onClick={() => removerVariante(indice)} className="shrink-0 text-xs text-red-500">
                    remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {produto && (
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" name="ativo" defaultChecked={produto.ativo} />
          Produto ativo (visível na loja)
        </label>
      )}

      {estado?.erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{estado.erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-brand-foreground font-semibold text-sm transition-colors"
      >
        {pending ? "Salvando…" : produto ? "Salvar alterações" : "Cadastrar produto"}
      </button>
    </form>
  );
}

function Campo({
  label,
  name,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
      {label}
      <input
        name={name}
        {...props}
        className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}
