import { NextRequest, NextResponse } from "next/server";
import { getComboSuggestionsDb } from "@/lib/data/products-db";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    categorias: string[];
    excluirProductIds?: string[];
  } | null;

  if (!body?.categorias?.length) {
    return NextResponse.json({ sugestoes: [] });
  }

  const sugestoes = await getComboSuggestionsDb(body.categorias, body.excluirProductIds ?? [], 3);
  return NextResponse.json({ sugestoes });
}
