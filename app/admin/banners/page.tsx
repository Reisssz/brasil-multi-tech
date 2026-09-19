import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { BannerUploadForm } from "./BannerUploadForm";
import { alternarAtivoBannerPrincipal, moverBannerPrincipal, removerBannerPrincipal } from "./actions";

type LinhaBanner = {
  id: string;
  posicao: number;
  ativo: boolean;
  href: string | null;
  imagem_desktop_url: string;
  imagem_mobile_url: string | null;
};

/**
 * Painel do banner principal (Hero) — cadastro pelo Storage/tabela do
 * Supabase, pra não depender mais de alguém soltar arquivo manualmente em
 * public/banners/banners-principal. Se a tabela `banners_principais` ainda
 * não existir neste projeto Supabase, mostramos a instrução de setup em vez
 * da lista, e o Hero continua funcionando normalmente pelo modo antigo
 * (arquivos) até a tabela ser criada.
 */
export default async function AdminBanners() {
  const supabaseAdmin = createAdminClient();
  const { data: banners, error } = await supabaseAdmin
    .from("banners_principais")
    .select("id, posicao, ativo, href, imagem_desktop_url, imagem_mobile_url")
    .order("posicao", { ascending: true });

  const tabelaInexistente = !!error;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Banner principal</h1>
        <Link href="/admin" className="text-sm font-semibold text-brand-dark hover:underline shrink-0">
          ← Voltar
        </Link>
      </div>
      <p className="text-sm text-muted mb-6">
        Essas imagens aparecem no carrossel do topo do site (Hero), na home. A primeira da lista é a primeira a
        aparecer; use as setas para reordenar.
      </p>

      {tabelaInexistente ? (
        <div className="rounded-2xl border border-[#f0d9a6] bg-[#fff8ec] p-5 text-sm text-foreground">
          <p className="font-semibold mb-2">Configuração pendente no Supabase</p>
          <p className="mb-3">
            Ainda falta criar a tabela <code className="font-mono">banners_principais</code> e o bucket de Storage{" "}
            <code className="font-mono">banners</code> (público) no seu projeto Supabase. Rode o SQL abaixo em
            SQL Editor → New query e crie o bucket em Storage → New bucket (marque como público) antes de usar esta
            tela.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-[#1c1e26] text-white text-xs p-3">
            {`create table public.banners_principais (
  id uuid primary key default gen_random_uuid(),
  posicao integer not null default 0,
  ativo boolean not null default true,
  href text,
  imagem_desktop_url text not null,
  imagem_desktop_largura integer,
  imagem_desktop_altura integer,
  imagem_mobile_url text,
  imagem_mobile_largura integer,
  imagem_mobile_altura integer,
  created_at timestamptz not null default now()
);

alter table public.banners_principais enable row level security;
-- Sem policies: só o service role (usado pelo servidor) acessa esta
-- tabela — a mesma proteção usada pelo bucket de documentos de venda.`}
          </pre>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-8">
          {(banners ?? []).map((banner, i) => (
            <LinhaBannerItem key={banner.id} banner={banner as LinhaBanner} indice={i} total={(banners ?? []).length} />
          ))}
          {(!banners || banners.length === 0) && (
            <p className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
              Nenhum banner cadastrado ainda — adicione o primeiro abaixo.
            </p>
          )}
        </div>
      )}

      {!tabelaInexistente && <BannerUploadForm />}
    </div>
  );
}

function LinhaBannerItem({ banner, indice, total }: { banner: LinhaBanner; indice: number; total: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={banner.imagem_desktop_url} alt="" className="h-14 w-24 shrink-0 rounded-lg object-cover bg-[#f0f1f4]" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{banner.href || "Sem link"}</p>
        <p className="text-xs text-muted">{banner.imagem_mobile_url ? "Com versão mobile própria" : "Sem versão mobile própria"}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <form action={moverBannerPrincipal.bind(null, banner.id, "up")}>
          <button
            type="submit"
            disabled={indice === 0}
            aria-label="Mover para cima"
            className="h-8 w-8 rounded-lg border border-border text-foreground hover:bg-[#f7f8fa] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↑
          </button>
        </form>
        <form action={moverBannerPrincipal.bind(null, banner.id, "down")}>
          <button
            type="submit"
            disabled={indice === total - 1}
            aria-label="Mover para baixo"
            className="h-8 w-8 rounded-lg border border-border text-foreground hover:bg-[#f7f8fa] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↓
          </button>
        </form>
        <form action={alternarAtivoBannerPrincipal.bind(null, banner.id, banner.ativo)}>
          <button
            type="submit"
            className={`h-8 rounded-full px-3 text-xs font-semibold ${
              banner.ativo ? "bg-success-light text-success" : "bg-[#eef0f3] text-muted"
            }`}
          >
            {banner.ativo ? "Ativo" : "Inativo"}
          </button>
        </form>
        <form action={removerBannerPrincipal.bind(null, banner.id)}>
          <button type="submit" className="h-8 rounded-lg px-3 text-xs font-medium text-red-500 hover:underline">
            Remover
          </button>
        </form>
      </div>
    </div>
  );
}
