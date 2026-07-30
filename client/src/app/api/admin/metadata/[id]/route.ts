import { NextResponse } from "next/server";

import {
  parseMetadataOptionUpdate,
  type MetadataOptionUpdate,
} from "@/lib/metadataOptionRequest";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const metadataId = Number(id);

  if (!Number.isInteger(metadataId) || metadataId < 1) {
    return NextResponse.json({ error: "Invalid metadata ID." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  let metadataOption: MetadataOptionUpdate;

  try {
    metadataOption = parseMetadataOptionUpdate(await request.json());
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Metadata details are invalid.",
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("metadata_options")
    .update(metadataOption)
    .eq("id", metadataId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23505") {
    return NextResponse.json(
      { error: "This metadata value is already configured." },
      { status: 409 },
    );
  }

  if (error) {
    return NextResponse.json(
      { error: "Unable to update metadata: " + error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Metadata value not found." }, { status: 404 });
  }

  return NextResponse.json({ id: data.id });
}

type MetadataOptionReference = {
  id: number;
  entity_type: "catalog" | "product";
  field_key:
    | "category"
    | "format"
    | "fulfillment_type"
    | "currency"
    | "image_position"
    | "tag";
  value: string;
};

async function isMetadataOptionInUse(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  metadataOption: MetadataOptionReference,
) {
  if (metadataOption.entity_type === "catalog") {
    const { count, error } = await supabase
      .from("catalogs")
      .select("id", { count: "exact", head: true })
      .eq("image_position", metadataOption.value);

    if (error) {
      throw new Error(error.message);
    }

    return (count ?? 0) > 0;
  }

  let result;

  if (metadataOption.field_key === "tag") {
    result = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .contains("tags", [metadataOption.value]);
  } else {
    const productField = metadataOption.field_key;
    result = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq(productField, metadataOption.value);
  }

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.count ?? 0) > 0;
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const metadataId = Number(id);

  if (!Number.isInteger(metadataId) || metadataId < 1) {
    return NextResponse.json({ error: "Invalid metadata ID." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  const { data: metadataOption, error: metadataError } = await supabase
    .from("metadata_options")
    .select("id, entity_type, field_key, value")
    .eq("id", metadataId)
    .maybeSingle();

  if (metadataError) {
    return NextResponse.json(
      { error: "Unable to check metadata: " + metadataError.message },
      { status: 500 },
    );
  }

  if (!metadataOption) {
    return NextResponse.json({ error: "Metadata value not found." }, { status: 404 });
  }

  try {
    if (
      await isMetadataOptionInUse(
        supabase,
        metadataOption as MetadataOptionReference,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "This value is assigned to an existing catalog or product. Mark it inactive instead.",
        },
        { status: 409 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Unable to check whether this value is in use: " +
          (error instanceof Error ? error.message : "Unknown error."),
      },
      { status: 500 },
    );
  }

  const { error: deleteError } = await supabase
    .from("metadata_options")
    .delete()
    .eq("id", metadataId);

  if (deleteError) {
    return NextResponse.json(
      { error: "Unable to remove metadata: " + deleteError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: metadataId });
}
