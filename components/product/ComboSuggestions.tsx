import { getComboSuggestionsDb } from "@/lib/data/products-db";
import { ComboSuggestionCard } from "./ComboSuggestionCard";

export async function ComboSuggestions({ productId, category }: { productId: string; category: string }) {
  const sugestoes = await getComboSuggestionsDb([category], [productId], 3);

  if (sugestoes.length === 0) return null;

  return (
    <div className="mt-14">
      <h2 className="text-xl font-bold text-foreground mb-1">Complete seu combo</h2>
      <p className="text-sm text-muted mb-5">Quem leva este produto também costuma levar:</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
        {sugestoes.map((s) => (
          <ComboSuggestionCard key={s.id} sugestao={s} />
        ))}
      </div>
    </div>
  );
}
