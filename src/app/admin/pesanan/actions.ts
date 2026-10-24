
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  success: boolean;
  message: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function refreshOrderPages() {
  revalidatePath("/admin/pesanan");
  revalidatePath("/admin/inventori");
  revalidatePath("/admin/dashboard");
  revalidatePath("/courier/dashboard");
  revalidatePath("/courier/tugas");
  revalidatePath("/courier/operasional");
  revalidatePath("/courier/riwayat");
  revalidatePath("/buyer/pesanan");
  revalidatePath("/supplier/pesanan");
}

export async function changeOrderStatus(
  orderId: string,
  nextStatus: string
): Promise<ActionResult> {
  try {
    await requireRole("admin");

    const allowed = [
      "processing",
      "shipped",
      "completed",
      "cancelled",
    ];

    if (
      !UUID_PATTERN.test(orderId) ||
      !allowed.includes(nextStatus)
    ) {
      return {
        success: false,
        message: "Permintaan tidak valid.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc(
      "change_putarasa_order_status",
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

    refreshOrderPages();

    return {
      success: true,
      message: "Status pesanan berhasil diperbarui.",
    };
  } catch {
    return {
      success: false,
      message: "Gagal memperbarui status pesanan.",
    };
  }
}

export async function assignOrderCourier(
  orderId: string,
  courierId: string,
  latitude: number,
  longitude: number
): Promise<ActionResult> {
  try {
    await requireRole("admin");

    if (
      !UUID_PATTERN.test(orderId) ||
      !UUID_PATTERN.test(courierId) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return {
        success: false,
        message: "Data penugasan tidak valid.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc(
      "assign_putarasa_order_courier",
      {
        p_order_id: orderId,
        p_courier_id: courierId,
        p_latitude: latitude,
        p_longitude: longitude,
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    refreshOrderPages();

    return {
      success: true,
      message: "Kurir berhasil ditugaskan.",
    };
  } catch {
    return {
      success: false,
      message: "Gagal menugaskan Kurir.",
    };
  }
}
