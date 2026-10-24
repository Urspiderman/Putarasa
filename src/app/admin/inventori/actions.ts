
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type InventoryPayload = {
  productId: string;
  movementType: "in" | "out" | "adjustment";
  quantity: number;
  notes: string;
  sourceOutputId?: string | null;
};

export async function recordInventory(
  payload: InventoryPayload
) {
  try {
    await requireRole("admin");

    if (
      !payload.productId ||
      !["in", "out", "adjustment"].includes(
        payload.movementType
      ) ||
      !Number.isFinite(payload.quantity) ||
      payload.quantity < 0 ||
      (payload.movementType !== "adjustment" &&
        payload.quantity <= 0)
    ) {
      return {
        success: false,
        message: "Data transaksi stok tidak valid.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc(
      "record_putarasa_inventory",
      {
        p_product_id: payload.productId,
        p_movement_type: payload.movementType,
        p_quantity: payload.quantity,
        p_notes: payload.notes,
        p_source_output_id:
          payload.sourceOutputId || null,
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/admin/inventori");
    revalidatePath("/admin/produk");

    return {
      success: true,
      message: "Transaksi stok berhasil disimpan.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan transaksi stok.",
    };
  }
}
