import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type InventoryAction = "add" | "deduct" | "set";

type InventoryAdjustment = {
  action: InventoryAction;
  note: string;
  quantity: number;
};

function parseAdjustment(payload: unknown): InventoryAdjustment {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("An inventory adjustment is required.");
  }

  const values = payload as Record<string, unknown>;
  const { action, note, quantity } = values;

  if (action !== "add" && action !== "deduct" && action !== "set") {
    throw new Error("Choose whether to add, deduct, or set stock.");
  }

  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 0
  ) {
    throw new Error("Quantity must be a non-negative whole number.");
  }

  if (action !== "set" && quantity === 0) {
    throw new Error("Add and deduct quantities must be greater than zero.");
  }

  if (typeof note !== "string" || note.trim().length === 0) {
    throw new Error("A stock adjustment note is required.");
  }

  if (note.trim().length > 2000) {
    throw new Error("The stock adjustment note is too long.");
  }

  return {
    action,
    note: note.trim(),
    quantity,
  };
}

export async function POST(
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

  let adjustment: InventoryAdjustment;

  try {
    adjustment = parseAdjustment(await request.json());
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The inventory adjustment is invalid.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  const sourceReference = "admin-stock-" + crypto.randomUUID();
  const { data, error } = await supabase.rpc("adjust_product_inventory", {
    p_action: adjustment.action,
    p_note: adjustment.note,
    p_product_id: productId,
    p_quantity: adjustment.quantity,
    p_source_reference: sourceReference,
  });

  if (error) {
    return NextResponse.json(
      { error: "Unable to adjust stock: " + error.message },
      { status: 400 },
    );
  }

  const result = Array.isArray(data) ? data[0] : data;

  return NextResponse.json({ adjustment: result });
}
