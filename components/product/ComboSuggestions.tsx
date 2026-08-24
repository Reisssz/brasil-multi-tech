import { getComboSuggestionsDb } from "@/lib/data/products-db";
import { getMainPhoto } from "@/lib/data/products";
import { ComboKit } from "./ComboKit";
import { Product, ProductVariant } from "@/lib/types";

export async function ComboSuggestions({
  productId,
  category,
  productName,
  variant,
}: {
  productId: string;
  category: string;
  productName: string;
  variant: ProductVariant;
}) {
  const sugestoes = await getComboSuggestionsDb([category], [productId], 4);

  if (sugestoes.length === 0) return null;

  const fotoBase = getMainPhoto(variant) ?? null;

  return (
    <ComboKit
      produtoBase={{
        id: productId,
        variantId: variant.id,
        name: productName,
        priceCents: variant.priceCents,
        photoUrl: fotoBase,
        icone: (variant.images?.[0] as string) ?? "accessory",
      }}
      sugestoes={sugestoes}
    />
  );
}