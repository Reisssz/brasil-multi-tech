import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";

const PASTA_BANNERS = path.join(process.cwd(), "public", "banners");
const PASTA_BANNERS_PRINCIPAL = path.join(PASTA_BANNERS, "banners-principal");
// Aceita os dois nomes de pasta pra versão mobile — já apareceram arquivos
// nos dois ("banner-mobile" e "banners-mobile") em momentos diferentes, e
// travar num nome só faz o Hero voltar a cair no banner principal sempre
// que alguém soltar os arquivos no outro. Usa o primeiro que tiver arquivo.
const PASTAS_BANNERS_MOBILE = ["banner-mobile", "banners-mobile"].map((nome) => path.join(PASTA_BANNERS, nome));
const EXTENSOES = "png|jpe?g|webp|avif";

export type Banner = {
  src: string;
  href: string | null;
  width?: number;
  height?: number;
  /** Versão mobile deste MESMO slide, cadastrada junto no painel admin (/admin/banners) — tem prioridade sobre o pareamento por ordem das pastas de arquivo. */
  mobileSrc?: string;
  mobileWidth?: number;
  mobileHeight?: number;
};

export type LinhaBannerPrincipal = {
  id: string;
  posicao: number;
  ativo: boolean;
  href: string | null;
  imagem_desktop_url: string;
  imagem_desktop_largura: number | null;
  imagem_desktop_altura: number | null;
  imagem_mobile_url: string | null;
  imagem_mobile_largura: number | null;
  imagem_mobile_altura: number | null;
};

/**
 * Banners do Hero cadastrados pelo admin em /admin/banners (tabela
 * `banners_principais`, ver lib/supabase/admin.ts). `null` quando a tabela
 * ainda não existe nesse projeto Supabase (site que não configurou o painel
 * ainda) — nesse caso quem chama cai de volta pro modo antigo (arquivos em
 * public/banners/banners-principal).
 */
async function buscarBannersPrincipaisDb(somenteAtivos: boolean): Promise<LinhaBannerPrincipal[] | null> {
  try {
    const supabase = createAdminClient();
    let query = supabase.from("banners_principais").select("*").order("posicao", { ascending: true });
    if (somenteAtivos) query = query.eq("ativo", true);
    const { data, error } = await query;
    if (error) return null;
    return data as LinhaBannerPrincipal[];
  } catch {
    return null;
  }
}

function listarArquivos(pasta: string): string[] {
  try {
    return fs.readdirSync(pasta);
  } catch {
    return [];
  }
}

/** Qualquer imagem com "venda"/"vendas" no nome leva o cliente pra tela de vender aparelho. */
function hrefPorNome(nome: string): string | null {
  return /venda/i.test(nome) ? "/vender" : null;
}

/** Largura/altura reais do arquivo (sharp) — undefined se a leitura falhar (formato corrompido/exótico). */
async function lerDimensoes(caminho: string): Promise<{ width?: number; height?: number }> {
  try {
    const metadata = await sharp(caminho).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch {
    return {};
  }
}

/**
 * Banners promocionais numerados (banner1.webp, banner2-venda.png, ...) —
 * o time de marketing só solta o arquivo em public/banners com esse padrão
 * de nome, sem precisar mexer em código. Pega quantos existirem, na ordem
 * do número. Um sufixo como "-venda" no nome (ex: banner2-venda.webp) faz
 * esse banner específico levar pra /vender.
 *
 * Lê a largura/altura reais de cada arquivo (sharp) pra quem for exibir a
 * esteira poder respeitar a proporção original de cada imagem em vez de
 * forçar um aspect-ratio fixo — o que cortava/distorcia banners que não
 * viessem exatamente 16:9 (ver PromoCarousel).
 */
export async function listarBannersPromocionais(): Promise<Banner[]> {
  const regex = new RegExp(`^banner(\\d+)[-\\w]*\\.(${EXTENSOES})$`, "i");
  const arquivos = listarArquivos(PASTA_BANNERS)
    .map((nome) => ({ nome, match: nome.match(regex) }))
    .filter((x): x is { nome: string; match: RegExpMatchArray } => x.match !== null)
    .sort((a, b) => Number(a.match[1]) - Number(b.match[1]));

  return Promise.all(
    arquivos.map(async (x) => ({
      src: `/banners/${x.nome}`,
      href: hrefPorNome(x.nome),
      ...(await lerDimensoes(path.join(PASTA_BANNERS, x.nome))),
    }))
  );
}

/** Banner único de garantia (bannergarantia.webp) — retorna null se ainda não foi enviado. */
export async function getBannerGarantia(): Promise<Banner | null> {
  const regex = new RegExp(`^bannergarantia\\.(${EXTENSOES})$`, "i");
  const achado = listarArquivos(PASTA_BANNERS).find((nome) => regex.test(nome));
  if (!achado) return null;
  return { src: `/banners/${achado}`, href: hrefPorNome(achado), ...(await lerDimensoes(path.join(PASTA_BANNERS, achado))) };
}

/**
 * Lê todas as imagens de uma pasta de banners do Hero, na ordem
 * alfabética/natural do nome, com a largura/altura reais de cada arquivo
 * (sharp) — o Hero usa isso pra calcular a proporção sozinho, em vez de um
 * aspect-ratio fixo no código. Se a leitura de um arquivo falhar (formato
 * corrompido/exótico), width/height ficam undefined pra esse item.
 */
async function lerBannersDePasta(pasta: string, urlBase: string): Promise<Banner[]> {
  const regexImagem = new RegExp(`\\.(${EXTENSOES})$`, "i");
  const nomes = listarArquivos(pasta)
    .filter((nome) => regexImagem.test(nome))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));

  return Promise.all(
    nomes.map(async (nome) => ({
      src: `${urlBase}/${encodeURIComponent(nome)}`,
      href: hrefPorNome(nome),
      ...(await lerDimensoes(path.join(pasta, nome))),
    }))
  );
}

/**
 * Banners do header principal (Hero). Prioriza os cadastrados pelo admin em
 * /admin/banners (tabela banners_principais); se a tabela ainda não existir
 * ou estiver vazia, cai no modo antigo — qualquer imagem solta em
 * public/banners/banners-principal. Imagens de arquivo com "venda"/"vendas"
 * no nome levam pra /vender; as cadastradas pelo admin usam o campo `href`
 * escolhido no painel.
 */
export async function listarBannersPrincipais(): Promise<Banner[]> {
  const linhas = await buscarBannersPrincipaisDb(true);
  if (linhas && linhas.length > 0) {
    return linhas.map((l) => ({
      src: l.imagem_desktop_url,
      href: l.href,
      width: l.imagem_desktop_largura ?? undefined,
      height: l.imagem_desktop_altura ?? undefined,
      mobileSrc: l.imagem_mobile_url ?? undefined,
      mobileWidth: l.imagem_mobile_largura ?? undefined,
      mobileHeight: l.imagem_mobile_altura ?? undefined,
    }));
  }
  return lerBannersDePasta(PASTA_BANNERS_PRINCIPAL, "/banners/banners-principal");
}

/**
 * Versão mobile dos banners do Hero — opcional. Quando os banners vêm do
 * painel admin, cada slide já carrega sua própria versão mobile embutida
 * (Banner.mobileSrc, ver listarBannersPrincipais) e este array volta vazio
 * de propósito, pra não duplicar o slide. Só cai no modo antigo (pareamento
 * por ordem entre pastas de arquivo) quando o banner principal também veio
 * do modo antigo.
 */
export async function listarBannersMobile(): Promise<Banner[]> {
  const linhas = await buscarBannersPrincipaisDb(true);
  if (linhas && linhas.length > 0) return [];

  for (const pasta of PASTAS_BANNERS_MOBILE) {
    if (listarArquivos(pasta).length > 0) {
      return lerBannersDePasta(pasta, `/banners/${path.basename(pasta)}`);
    }
  }
  return [];
}
