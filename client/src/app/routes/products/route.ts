import { NextResponse } from "next/server";
import { getProductCatalogPageData } from "@/api/products";

export async function GET() {
  const data = await getProductCatalogPageData();

  return NextResponse.json(data);
}
