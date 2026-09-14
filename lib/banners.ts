import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PASTA_BANNERS = path.join(process.cwd(), "public", "banners");
const PASTA_BANNERS_PRINCIPAL = path.join(PASTA_BANNERS, "banners-principal");
// Aceita os dois nomes de pasta pra versão mobile — já apareceram arquivos
// nos dois ("banner-mobile" e "banners-mobile") em momentos diferentes, e
// travar num nome só faz o Hero voltar a cair no banner principal sempre
// que alguém soltar os arquivos no outro. Usa o primeiro que tiver arquivo.
const PASTAS_BANNERS_MOBILE = ["banner-mobile", "banners-mobile"].map((nome) => path.join(PASTA_BANNERS, nome));
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
    nomes.map(async (nome) => {
      let width: number | undefined;
      let height: number | undefined;
      try {
        const metadata = await sharp(path.join(pasta, nome)).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch {
        // Sem dimensões — Hero usa o aspect-ratio padrão pra esse conjunto.
      }
      return {
        src: `${urlBase}/${encodeURIComponent(nome)}`,
        href: hrefPorNome(nome),
        width,
        height,
      };
    })
  );
}

/**
 * Banners do header principal (Hero) — qualquer imagem solta em
 * public/banners/banners-principal. Imagens com "venda"/"vendas" no nome
 * levam o cliente pra /vender; as demais aparecem só como imagem, sem
 * link.
 */
export function listarBannersPrincipais(): Promise<Banner[]> {
  return lerBannersDePasta(PASTA_BANNERS_PRINCIPAL, "/banners/banners-principal");
}

/**
 * Versão mobile dos banners do Hero — opcional. Qualquer imagem solta em
 * public/banners/banner-mobile (ou banners-mobile — ver PASTAS_BANNERS_MOBILE)
 * é pareada por ORDEM com o banner principal de mesmo índice (1º com 1º, 2º
 * com 2º...); se essa pasta estiver vazia ou tiver menos imagens que a
 * principal, os banners que sobrarem usam a versão principal normalmente
 * (cortada pelo object-cover). Pasta não existir não é erro — listarArquivos
 * já trata isso e retorna [].
 */
export async function listarBannersMobile(): Promise<Banner[]> {
  for (const pasta of PASTAS_BANNERS_MOBILE) {
    if (listarArquivos(pasta).length > 0) {
      return lerBannersDePasta(pasta, `/banners/${path.basename(pasta)}`);
    }
  }
  return [];
}
