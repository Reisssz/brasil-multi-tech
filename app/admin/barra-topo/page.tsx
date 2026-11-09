import { getConfiguracaoBarraTopo } from "@/lib/data/promo-bar";
import { FormularioBarraTopo } from "./FormularioBarraTopo";

export const metadata = { title: "Barra do topo" };

export default async function AdminBarraTopo() {
  const config = await getConfiguracaoBarraTopo();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Barra do topo</h1>
      <p className="text-sm text-muted mb-6">
        Faixa colorida no alto do site (visível em telas maiores) que alterna as mensagens abaixo a cada 4 segundos.
      </p>
      <FormularioBarraTopo config={config} />
    </div>
  );
}
