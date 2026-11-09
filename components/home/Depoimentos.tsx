import Image from "next/image";
import { StarRating } from "../ui/StarRating";
import { getAvaliacoesGoogle } from "@/lib/data/google-reviews";
import { Reveal } from "../ui/Reveal";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function Depoimentos() {
  const google = await getAvaliacoesGoogle();
  if (!google || google.avaliacoes.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-8 sm:py-10">
      <Reveal className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Quem compra, recomenda</h2>
          <p className="text-muted mt-1">Avaliações reais de clientes no Google.</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating rating={google.nota} reviewCount={google.total} size="md" />
          {google.url && (
            <a href={google.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand-dark hover:underline underline-offset-2">
              Ver todas no Google ↗
            </a>
          )}
        </div>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {google.avaliacoes.map((r, i) => (
          <Reveal
            key={`${r.autor}-${i}`}
            delay={(i % 3) * 70}
            className="rounded-2xl bg-surface border border-border p-5 flex flex-col gap-3 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-3">
              {r.fotoAutor ? (
                <Image src={r.fotoAutor} alt="" width={36} height={36} className="w-9 h-9 rounded-full shrink-0" />
              ) : (
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-light text-brand-dark text-xs font-bold shrink-0">
                  {initials(r.autor)}
                </span>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{r.autor}</span>
                <span className="text-xs text-muted">{r.quando}</span>
              </div>
            </div>
            <StarRating rating={r.nota} />
            <p className="text-sm text-muted leading-relaxed">{r.texto}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
