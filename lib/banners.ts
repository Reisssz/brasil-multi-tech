import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PASTA_BANNERS = path.join(process.cwd(), "public", "banners");
const PASTA_BANNERS_PRINCIPAL = path.join(PASTA_BANNERS, "banners-principal");
const EXTENSOES = "png|jpe?g|webp|avif";

export type Banner = { src: string; href: string | null; width?: number; height?: number };

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
 *
 * Lê a largura/altura reais de cada arquivo (sharp) pro Hero calcular a
 * proporção sozinho, em vez de um aspect-ratio fixo no código — assim o
 * time de marketing pode trocar a resolução dos banners sem precisar de
 * ajuste manual no CSS toda vez. Se a leitura falhar num arquivo (formato
 * corrompido/exótico), width/height ficam undefined e o Hero cai num
 * aspect-ratio padrão de segurança.
 */
export async function listarBannersPrincipais(): Promise<Banner[]> {
  const regexImagem = new RegExp(`\\.(${EXTENSOES})$`, "i");
  const nomes = listarArquivos(PASTA_BANNERS_PRINCIPAL)
    .filter((nome) => regexImagem.test(nome))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));

  return Promise.all(
    nomes.map(async (nome) => {
      let width: number | undefined;
      let height: number | undefined;
      try {
        const metadata = await sharp(path.join(PASTA_BANNERS_PRINCIPAL, nome)).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch {
        // Sem dimensões — Hero usa o aspect-ratio padrão pra esse conjunto.
      }
      return {
        src: `/banners/banners-principal/${encodeURIComponent(nome)}`,
        href: hrefPorNome(nome),
        width,
        height,
      };
    })
  );
}
