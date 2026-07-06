import { NextResponse } from "next/server";
import { getProductCatalogPageData } from "@/lib/products";

export async function GET() {
  const data = await getProductCatalogPageData();

  return NextResponse.json(data);
}
