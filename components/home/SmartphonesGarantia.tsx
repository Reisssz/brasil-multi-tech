import { getSmartphonesComGarantiaDb } from "@/lib/data/products-db";
import { OfertaRow } from "./OfertaRow";

/**
 * Garantia mínima em meses desta vitrine — usada tanto no filtro quanto no
 * título, pra os dois nunca divergirem (antes o título dizia 6 meses e o
 * filtro exigia 12, escondendo produtos que deveriam aparecer).
 */
const GARANTIA_MINIMA_MESES = 6;

export async function SmartphonesGarantia() {
  const produtos = await getSmartphonesComGarantiaDb(GARANTIA_MINIMA_MESES, 5);
  return (
    <OfertaRow
      titulo={`Smartphones com ${GARANTIA_MINIMA_MESES} meses de garantia`}
      subtitulo="Tranquilidade extra pra você comprar sem medo."
      produtos={produtos}
    />
  );
}
