import "server-only";

export type AvaliacaoGoogle = {
  autor: string;
  fotoAutor: string | null;
  nota: number;
  texto: string;
  quando: string;
  url: string | null;
};

export type ResumoGoogle = {
  nota: number;
  total: number;
  url: string | null;
  avaliacoes: AvaliacaoGoogle[];
};

type RespostaPlaces = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: Array<{
    rating?: number;
    relativePublishTimeDescription?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    googleMapsUri?: string;
    authorAttribution?: { displayName?: string; photoUri?: string };
  }>;
};

/**
 * Avaliações reais do perfil no Google Meu Negócio via Places API (New).
 * Exige GOOGLE_PLACES_API_KEY e GOOGLE_PLACE_ID; sem eles (ou se a API falhar)
 * devolve null e a seção some, em vez de exibir avaliações inventadas.
 * A API devolve no máximo 5 avaliações por consulta.
 */
export async function getAvaliacoesGoogle(): Promise<ResumoGoogle | null> {
  const chave = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!chave || !placeId) return null;

  try {
    const resposta = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=pt-BR`, {
      headers: {
        "X-Goog-Api-Key": chave,
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
      },
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!resposta.ok) {
      console.error("[google-reviews] Places API respondeu", resposta.status, await resposta.text().catch(() => ""));
      return null;
    }

    const dados = (await resposta.json()) as RespostaPlaces;
    if (typeof dados.rating !== "number") return null;

    const avaliacoes = (dados.reviews ?? [])
      .map((r) => ({
        autor: r.authorAttribution?.displayName ?? "Cliente",
        fotoAutor: r.authorAttribution?.photoUri ?? null,
        nota: r.rating ?? 0,
        texto: (r.text?.text ?? r.originalText?.text ?? "").trim(),
        quando: r.relativePublishTimeDescription ?? "",
        url: r.googleMapsUri ?? null,
      }))
      .filter((r) => r.texto.length > 0 && r.nota > 0);

    return { nota: dados.rating, total: dados.userRatingCount ?? 0, url: dados.googleMapsUri ?? null, avaliacoes };
  } catch (erro) {
    console.error("[google-reviews] falha ao buscar avaliações:", erro);
    return null;
  }
}
