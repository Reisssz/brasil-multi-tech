import { getOfertasDoDiaDb } from "@/lib/data/products-db";
import { OfertaRow } from "./OfertaRow";

export async function OfertasDoDia() {
  const ofertas = await getOfertasDoDiaDb(10);
  return <OfertaRow titulo="Ofertas do dia" subtitulo="Descontos ativos em todas as categorias, agora." produtos={ofertas} />;
}
