
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

type ActionResult = {
  success: boolean;
  message: string;
};

export async function addToSupplierCart(
  productId: string,
  quantity: number
): Promise<ActionResult> {
  try {
    await requireRole("supplier");

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(productId)) {
      return {
        success: false,
        message: "ID produk tidak valid.",
      };
    }

    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 1000
    ) {
      return {
        success: false,
        message: "Jumlah pembelian tidak valid.",
      };
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Silakan login kembali.",
      };
    }

    const { data: product, error: productError } =
      await supabase
        .from("putarasa_products")
        .select("id,is_active")
        .eq("id", productId)
        .eq("is_active", true)
        .maybeSingle();

    if (productError || !product) {
      return {
        success: false,
        message: "Produk tidak tersedia.",
      };
    }

    const { data: inventory, error: stockError } =
      await supabase
        .from("putarasa_inventory")
        .select("quantity")
        .eq("product_id", productId)
        .maybeSingle();

    if (stockError) {
      return {
        success: false,
        message: "Gagal memeriksa stok.",
      };
    }

    const stock = Number(inventory?.quantity ?? 0);

    const { data: existing, error: cartError } =
      await supabase
        .from("putarasa_cart_items")
        .select("id,quantity")
        .eq("buyer_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

    if (cartError) {
      return {
        success: false,
        message: cartError.message,
      };
    }

    const nextQuantity =
      Number(existing?.quantity ?? 0) + quantity;

    if (
      !Number.isSafeInteger(nextQuantity) ||
      nextQuantity > stock
    ) {
      return {
        success: false,
        message: `Stok tidak mencukupi. Tersedia ${stock} unit.`,
      };
    }

    if (existing) {
      const { error } = await supabase
        .from("putarasa_cart_items")
        .update({
          quantity: nextQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .eq("buyer_id", user.id);

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    } else {
      const { error } = await supabase
        .from("putarasa_cart_items")
        .insert({
          buyer_id: user.id,
          product_id: productId,
          quantity,
        });

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    }

    revalidatePath("/supplier/keranjang");

    return {
      success: true,
      message: "Produk berhasil ditambahkan ke keranjang.",
    };
  } catch {
    return {
      success: false,
      message: "Gagal menambahkan produk. Silakan coba lagi.",
    };
  }
}
