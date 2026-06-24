import { NextResponse } from "next/server";
import { getProductCatalogPageData } from "@/localdata/products";

export async function GET() {
  const data = await getProductCatalogPageData();

  return NextResponse.json(data);
}
