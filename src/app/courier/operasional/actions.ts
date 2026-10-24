
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type DeliveryStatus = "shipped" | "completed";

type ActionResult = {
  success: boolean;
  message: string;
};

export async function updateCourierDeliveryStatus(
  orderId: string,
  nextStatus: DeliveryStatus
): Promise<ActionResult> {
  try {
    await requireRole("courier");

    if (
      !orderId ||
      !["shipped", "completed"].includes(nextStatus)
    ) {
      return {
        success: false,
        message: "Permintaan tidak valid.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc(
      "update_courier_delivery_status",
      {
        p_order_id: orderId,
        p_next_status: nextStatus,
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/courier/dashboard");
    revalidatePath("/courier/tugas");
    revalidatePath("/courier/operasional");
    revalidatePath("/courier/riwayat");
    revalidatePath("/admin/pesanan");
    revalidatePath("/admin/dashboard");
    revalidatePath("/buyer/pesanan");
    revalidatePath("/supplier/pesanan");

    return {
      success: true,
      message:
        nextStatus === "shipped"
          ? "Pengiriman berhasil dimulai."
          : "Pengiriman berhasil diselesaikan.",
    };
  } catch {
    return {
      success: false,
      message: "Gagal memperbarui pengiriman.",
    };
  }
}
