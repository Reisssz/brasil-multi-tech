import { getOfertasCategoriaDb } from "@/lib/data/products-db";
import { OfertaRow } from "./OfertaRow";

export async function OfertasNotebooks() {
  const ofertas = await getOfertasCategoriaDb("notebooks", 5);
  return <OfertaRow titulo="Notebooks em Oferta" subtitulo="Desempenho e economia com desconto ativo." produtos={ofertas} />;
}
