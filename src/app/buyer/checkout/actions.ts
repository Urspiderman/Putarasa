
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type CheckoutInput = {
  cartItemIds: string[];
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  notes: string;
};

type CheckoutResult = {
  success: boolean;
  message: string;
  orderId?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function createCheckoutOrder(
  input: CheckoutInput
): Promise<CheckoutResult> {
  try {
    await requireRole("buyer");

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Sesi login berakhir. Silakan login kembali.",
      };
    }

    const ids = input.cartItemIds;

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.length > 100 ||
      ids.some((id) => !UUID_PATTERN.test(id)) ||
      new Set(ids).size !== ids.length
    ) {
      return {
        success: false,
        message: "Pilihan produk tidak valid.",
      };
    }

    const name = input.customerName?.trim() ?? "";
    const phone = input.customerPhone?.trim() ?? "";
    const address = input.shippingAddress?.trim() ?? "";
    const notes = input.notes?.trim() ?? "";

    if (name.length < 2 || name.length > 150) {
      return {
        success: false,
        message: "Nama penerima harus terdiri dari 2–150 karakter.",
      };
    }

    if (!/^\+?[0-9\s()-]{8,30}$/.test(phone)) {
      return {
        success: false,
        message: "Nomor telepon tidak valid.",
      };
    }

    if (address.length < 10 || address.length > 1000) {
      return {
        success: false,
        message: "Alamat pengiriman minimal 10 karakter.",
      };
    }

    if (notes.length > 2000) {
      return {
        success: false,
        message: "Catatan terlalu panjang.",
      };
    }

    const { data, error } = await supabase.rpc(
      "putarasa_checkout",
      {
        p_cart_item_ids: ids,
        p_customer_name: name,
        p_customer_phone: phone,
        p_shipping_address: address,
        p_notes: notes || null,
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    if (typeof data !== "string") {
      return {
        success: false,
        message: "Pesanan gagal dikonfirmasi.",
      };
    }

    revalidatePath("/buyer/keranjang");
    revalidatePath("/buyer/pesanan");
    revalidatePath("/buyer/marketplace");
    revalidatePath("/buyer/dashboard");
    revalidatePath("/admin/pesanan");
    revalidatePath("/admin/inventori");

    return {
      success: true,
      message: "Pesanan berhasil dibuat.",
      orderId: data,
    };
  } catch {
    return {
      success: false,
      message: "Terjadi kesalahan saat membuat pesanan.",
    };
  }
}
