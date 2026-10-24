
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProductPayload = {
  id: string | null;
  name: string;
  sku: string;
  category: "compost" | "maggot" | "other";
  description: string;
  price: number;
  unit: string;
  is_active: boolean;
};

export async function saveProduct(
  payload: ProductPayload
) {
  try {
    await requireRole("admin");

    if (
      !payload.name.trim() ||
      !payload.sku.trim() ||
      !payload.unit.trim() ||
      !Number.isFinite(payload.price) ||
      payload.price < 0
    ) {
      return {
        success: false,
        message: "Lengkapi data produk dengan benar.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc(
      "save_putarasa_product",
      {
        p_id: payload.id,
        p_name: payload.name,
        p_sku: payload.sku,
        p_category: payload.category,
        p_description: payload.description,
        p_price: payload.price,
        p_unit: payload.unit,
        p_is_active: payload.is_active,
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/admin/produk");

    return {
      success: true,
      message: payload.id
        ? "Produk berhasil diperbarui."
        : "Produk berhasil ditambahkan.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan produk.",
    };
  }
}
