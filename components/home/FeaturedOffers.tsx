import { getOfertasAppleDb } from "@/lib/data/products-db";
import { OfertaRow } from "./OfertaRow";

export async function FeaturedOffers() {
  const ofertasApple = await getOfertasAppleDb(5);
  return <OfertaRow titulo="Celulares em Oferta" subtitulo="iPhones com desconto ativo agora." produtos={ofertasApple} />;
}
