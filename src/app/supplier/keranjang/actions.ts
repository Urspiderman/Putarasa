
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type CartResult = {
  success: boolean;
  message: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
): Promise<CartResult> {
  try {
    await requireRole("supplier");

    if (!uuidPattern.test(cartItemId)) {
      return {
        success: false,
        message: "ID keranjang tidak valid.",
      };
    }

    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 1000
    ) {
      return {
        success: false,
        message: "Jumlah produk tidak valid.",
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

    const { data: item, error: itemError } =
      await supabase
        .from("putarasa_cart_items")
        .select("id,product_id")
        .eq("id", cartItemId)
        .eq("buyer_id", user.id)
        .maybeSingle();

    if (itemError || !item) {
      return {
        success: false,
        message: "Produk keranjang tidak ditemukan.",
      };
    }

    const [productResult, stockResult] =
      await Promise.all([
        supabase
          .from("putarasa_products")
          .select("is_active")
          .eq("id", item.product_id)
          .maybeSingle(),

        supabase
          .from("putarasa_inventory")
          .select("quantity")
          .eq("product_id", item.product_id)
          .maybeSingle(),
      ]);

    if (
      productResult.error ||
      !productResult.data?.is_active
    ) {
      return {
        success: false,
        message: "Produk sudah tidak tersedia.",
      };
    }

    if (stockResult.error) {
      return {
        success: false,
        message: "Gagal memeriksa stok produk.",
      };
    }

    const stock = Number(
      stockResult.data?.quantity ?? 0
    );

    if (quantity > stock) {
      return {
        success: false,
        message: `Stok hanya tersedia ${stock} unit.`,
      };
    }

    const { data: updated, error } = await supabase
      .from("putarasa_cart_items")
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartItemId)
      .eq("buyer_id", user.id)
      .select("id");

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    if (!updated?.length) {
      return {
        success: false,
        message: "Gagal memperbarui produk keranjang.",
      };
    }

    revalidatePath("/supplier/keranjang");

    return {
      success: true,
      message: "Jumlah produk berhasil diperbarui.",
    };
  } catch {
    return {
      success: false,
      message: "Gagal memperbarui keranjang.",
    };
  }
}

export async function removeCartItem(
  cartItemId: string
): Promise<CartResult> {
  try {
    await requireRole("supplier");

    if (!uuidPattern.test(cartItemId)) {
      return {
        success: false,
        message: "ID keranjang tidak valid.",
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

    const { data, error } = await supabase
      .from("putarasa_cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("buyer_id", user.id)
      .select("id");

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    if (!data?.length) {
      return {
        success: false,
        message: "Produk tidak ditemukan di keranjang.",
      };
    }

    revalidatePath("/supplier/keranjang");

    return {
      success: true,
      message: "Produk berhasil dihapus dari keranjang.",
    };
  } catch {
    return {
      success: false,
      message: "Gagal menghapus produk.",
    };
  }
}
