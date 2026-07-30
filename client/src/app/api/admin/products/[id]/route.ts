import { NextResponse } from "next/server";

import { assertActiveMetadataValues } from "@/lib/adminMetadata";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ProductUpdate = {
  sku: string | null;
  name: string;
  category: string;
  description: string;
  format: string;
  fulfillment_type: string;
  price_amount: number;
  currency: string;
  image_url: string;
  image_urls: string[];
  image_alt: string;
  image_position: string | null;
  tags: string[];
  low_stock_threshold: number | null;
  reorder_point: number | null;
  reorder_quantity: number | null;
  is_featured: boolean;
  is_sample: boolean;
  is_active: boolean;
  catalog_id: number | null;
  display_order: number;
};

function getRequiredString(
  payload: Record<string, unknown>,
  field: string,
  maxLength: number,
) {
  const value = payload[field];

  if (typeof value !== "string") {
    throw new Error(field + " must be text.");
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    throw new Error(field + " is required.");
  }

  if (normalizedValue.length > maxLength) {
    throw new Error(field + " must be " + maxLength + " characters or fewer.");
  }

  return normalizedValue;
}

function getOptionalString(
  payload: Record<string, unknown>,
  field: string,
  maxLength: number,
) {
  const value = payload[field];

  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(field + " must be text.");
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length > maxLength) {
    throw new Error(field + " must be " + maxLength + " characters or fewer.");
  }

  return normalizedValue || null;
}

function getNonNegativeInteger(
  payload: Record<string, unknown>,
  field: string,
  optional = false,
) {
  const value = payload[field];

  if (optional && (value === null || value === undefined || value === "")) {
    return null;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(field + " must be a non-negative whole number.");
  }

  return value;
}

function getBoolean(payload: Record<string, unknown>, field: string) {
  const value = payload[field];

  if (typeof value !== "boolean") {
    throw new Error(field + " must be true or false.");
  }

  return value;
}

function getStringArray(payload: Record<string, unknown>, field: string) {
  const value = payload[field];

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(field + " must be a list of text values.");
  }

  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

function parseProductUpdate(payload: unknown): ProductUpdate {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("A product update payload is required.");
  }

  const values = payload as Record<string, unknown>;
  const priceAmount = values.price_amount;
  const catalogId = values.catalog_id;

  if (
    typeof priceAmount !== "number" ||
    !Number.isFinite(priceAmount) ||
    priceAmount < 0
  ) {
    throw new Error("price_amount must be a non-negative number.");
  }

  if (
    catalogId !== null &&
    (!Number.isInteger(catalogId) ||
      typeof catalogId !== "number" ||
      catalogId < 1)
  ) {
    throw new Error("catalog_id must be a positive whole number or null.");
  }

  const displayOrder = getNonNegativeInteger(values, "display_order");

  if (displayOrder === null) {
    throw new Error("display_order is required.");
  }

  return {
    sku: getOptionalString(values, "sku", 80),
    name: getRequiredString(values, "name", 180),
    category: getRequiredString(values, "category", 120),
    description: getRequiredString(values, "description", 10000),
    format: getRequiredString(values, "format", 80),
    fulfillment_type: getRequiredString(values, "fulfillment_type", 80),
    price_amount: priceAmount,
    currency: getRequiredString(values, "currency", 3).toUpperCase(),
    image_url: getRequiredString(values, "image_url", 2000),
    image_urls: getStringArray(values, "image_urls"),
    image_alt: getRequiredString(values, "image_alt", 1000),
    image_position: getOptionalString(values, "image_position", 40),
    tags: getStringArray(values, "tags"),
    low_stock_threshold: getNonNegativeInteger(
      values,
      "low_stock_threshold",
      true,
    ),
    reorder_point: getNonNegativeInteger(values, "reorder_point", true),
    reorder_quantity: getNonNegativeInteger(values, "reorder_quantity", true),
    is_featured: getBoolean(values, "is_featured"),
    is_sample: getBoolean(values, "is_sample"),
    is_active: getBoolean(values, "is_active"),
    catalog_id: catalogId,
    display_order: displayOrder,
  };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  let update: ProductUpdate;

  try {
    update = parseProductUpdate(await request.json());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The product data is invalid.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await assertActiveMetadataValues(supabase, "product", {
      category: [update.category],
      format: [update.format],
      fulfillment_type: [update.fulfillment_type],
      currency: [update.currency],
      ...(update.image_position
        ? { image_position: [update.image_position] }
        : {}),
      tag: update.tags,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Select configured metadata values before saving.",
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("products")
    .update(update)
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Unable to update product: " + error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23503") {
    return NextResponse.json(
      {
        error:
          "This product has inventory history and cannot be deleted. Mark it inactive instead to preserve the audit trail.",
      },
      { status: 409 },
    );
  }

  if (error) {
    return NextResponse.json(
      { error: "Unable to delete product: " + error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ id: data.id });
}
