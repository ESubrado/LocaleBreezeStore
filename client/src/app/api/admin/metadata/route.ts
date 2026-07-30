import { NextResponse } from "next/server";

import {
  parseMetadataOptionUpdate,
  type MetadataOptionUpdate,
} from "@/lib/metadataOptionRequest";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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
    .insert(metadataOption)
    .select("id")
    .single();

  if (error?.code === "23505") {
    return NextResponse.json(
      { error: "This metadata value is already configured." },
      { status: 409 },
    );
  }

  if (error) {
    return NextResponse.json(
      { error: "Unable to add metadata: " + error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
