import fs from "node:fs";
import path from "node:path";

const PASTA_BANNERS = path.join(process.cwd(), "public", "banners");
const PASTA_BANNERS_PRINCIPAL = path.join(PASTA_BANNERS, "banners-principal");
const EXTENSOES = "png|jpe?g|webp|avif";

export type Banner = { src: string; href: string | null };

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

/**
 * Banners promocionais numerados (banner1.webp, banner2-venda.png, ...) —
 * o time de marketing só solta o arquivo em public/banners com esse padrão
 * de nome, sem precisar mexer em código. Pega quantos existirem, na ordem
 * do número. Um sufixo como "-venda" no nome (ex: banner2-venda.webp) faz
 * esse banner específico levar pra /vender.
 */
export function listarBannersPromocionais(): Banner[] {
  const regex = new RegExp(`^banner(\\d+)[-\\w]*\\.(${EXTENSOES})$`, "i");
  return listarArquivos(PASTA_BANNERS)
    .map((nome) => ({ nome, match: nome.match(regex) }))
    .filter((x): x is { nome: string; match: RegExpMatchArray } => x.match !== null)
    .sort((a, b) => Number(a.match[1]) - Number(b.match[1]))
    .map((x) => ({ src: `/banners/${x.nome}`, href: hrefPorNome(x.nome) }));
}

/** Banner único de garantia (bannergarantia.webp) — retorna null se ainda não foi enviado. */
export function getBannerGarantia(): Banner | null {
  const regex = new RegExp(`^bannergarantia\\.(${EXTENSOES})$`, "i");
  const achado = listarArquivos(PASTA_BANNERS).find((nome) => regex.test(nome));
  return achado ? { src: `/banners/${achado}`, href: hrefPorNome(achado) } : null;
}

/**
 * Banners do header principal (Hero) — qualquer imagem solta em
 * public/banners/banners-principal, na ordem alfabética/natural do nome.
 * Imagens com "venda"/"vendas" no nome levam o cliente pra /vender; as
 * demais aparecem só como imagem, sem link.
 */
export function listarBannersPrincipais(): Banner[] {
  const regexImagem = new RegExp(`\\.(${EXTENSOES})$`, "i");
  return listarArquivos(PASTA_BANNERS_PRINCIPAL)
    .filter((nome) => regexImagem.test(nome))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }))
    .map((nome) => ({
      src: `/banners/banners-principal/${encodeURIComponent(nome)}`,
      href: hrefPorNome(nome),
    }));
}
