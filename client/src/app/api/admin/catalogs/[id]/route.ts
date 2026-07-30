import { NextResponse } from "next/server";

import { assertActiveMetadataValues } from "@/lib/adminMetadata";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CatalogUpdate = {
  title: string;
  description: string;
  sample_item_count: number;
  image_url: string;
  image_alt: string;
  image_position: string;
  examples: string[];
  display_order: number;
  is_active: boolean;
};

function getRequiredString(
  values: Record<string, unknown>,
  field: string,
  maxLength: number,
) {
  const value = values[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(field + " is required.");
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length > maxLength) {
    throw new Error(field + " must be " + maxLength + " characters or fewer.");
  }

  return normalizedValue;
}

function getNonNegativeInteger(values: Record<string, unknown>, field: string) {
  const value = values[field];

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(field + " must be a non-negative whole number.");
  }

  return value;
}

function getStringArray(values: Record<string, unknown>, field: string) {
  const value = values[field];

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(field + " must be a list of text values.");
  }

  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

function parseCatalogUpdate(payload: unknown): CatalogUpdate {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("A catalog update payload is required.");
  }

  const values = payload as Record<string, unknown>;
  const isActive = values.is_active;

  if (typeof isActive !== "boolean") {
    throw new Error("is_active must be true or false.");
  }

  return {
    title: getRequiredString(values, "title", 160),
    description: getRequiredString(values, "description", 10000),
    sample_item_count: getNonNegativeInteger(values, "sample_item_count"),
    image_url: getRequiredString(values, "image_url", 2000),
    image_alt: getRequiredString(values, "image_alt", 1000),
    image_position: getRequiredString(values, "image_position", 40),
    examples: getStringArray(values, "examples"),
    display_order: getNonNegativeInteger(values, "display_order"),
    is_active: isActive,
  };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const catalogId = Number(id);

  if (!Number.isInteger(catalogId) || catalogId < 1) {
    return NextResponse.json({ error: "Invalid catalog ID." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  let update: CatalogUpdate;

  try {
    update = parseCatalogUpdate(await request.json());
    await assertActiveMetadataValues(supabase, "catalog", {
      image_position: [update.image_position],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "The catalog data is invalid.",
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("catalogs")
    .update(update)
    .eq("id", catalogId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Unable to update catalog: " + error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
  }

  return NextResponse.json({ id: data.id });
}
