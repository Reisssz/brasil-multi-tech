import { NextResponse } from "next/server";
import { getAllActiveProductsForCache } from "@/lib/data/products-db";

export async function GET() {
  const produtos = await getAllActiveProductsForCache();
  return NextResponse.json({ produtos }, { headers: { "Cache-Control": "public, max-age=30" } });
}
