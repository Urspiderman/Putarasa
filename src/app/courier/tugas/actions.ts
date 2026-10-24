
"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CourierPickupAction =
  | "on_the_way"
  | "complete";

export type CourierActionResult = {
  success: boolean;
  message: string;
};

export async function updateCourierPickup(
  pickupId: string,
  action: CourierPickupAction,
  actualWeight?: number
): Promise<CourierActionResult> {
  await requireRole("courier");

  if (!pickupId) {
    return {
      success: false,
      message: "ID penjemputan tidak valid.",
    };
  }

  if (
    action !== "on_the_way" &&
    action !== "complete"
  ) {
    return {
      success: false,
      message: "Tindakan tidak valid.",
    };
  }

  if (
    action === "complete" &&
    (
      actualWeight === undefined ||
      !Number.isFinite(actualWeight) ||
      actualWeight <= 0
    )
  ) {
    return {
      success: false,
      message: "Berat aktual harus lebih dari 0 kg.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "courier_update_pickup",
    {
      p_pickup_id: pickupId,
      p_action: action,
      p_actual_weight_kg:
        action === "complete"
          ? actualWeight
          : null,
    }
  );

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/courier/tugas");
  revalidatePath("/courier/dashboard");
  revalidatePath("/courier/riwayat");
  revalidatePath("/admin/penjemputan");
  revalidatePath("/supplier/penjemputan");

  return {
    success: true,
    message:
      action === "on_the_way"
        ? "Perjalanan berhasil dimulai."
        : "Penjemputan berhasil diselesaikan.",
  };
}
